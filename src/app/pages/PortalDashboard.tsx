import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { MOCK_HOSPITALS } from '../constants/mockData';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, Clock, Phone, Check, X, Bell,
  Activity, MapPin, User, ChevronDown, ChevronUp,
  Loader2, MessageSquare, Eye, RefreshCw, Shield,
  TrendingUp, Users, LogOut, CheckCircle2, Zap, Brain,
  Search, Timer, Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';
import { TokenStatus } from '../types/token';
import { useNavigate } from 'react-router';
import { NoShowPredictor, NoShowInput } from '../services/noShowPredictor';
import { getTimeSince, getGreeting, formatClock } from '../utils/clinicUtils';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Mock hourly flow data (stays mock until token timestamps are granular)
const HOURLY_FLOW_DATA = [
  { hour: '8AM', patients: 4 }, { hour: '9AM', patients: 11 },
  { hour: '10AM', patients: 18 }, { hour: '11AM', patients: 14 },
  { hour: '12PM', patients: 9 }, { hour: '1PM', patients: 6 },
  { hour: '2PM', patients: 12 }, { hour: '3PM', patients: 15 },
  { hour: '4PM', patients: 10 }, { hour: '5PM', patients: 5 },
  { hour: '6PM', patients: 2 },
];

const PAYMENT_COLORS = { Online: '#14b8a6', Cash: '#f59e0b', Card: '#3b82f6' };

export const PortalDashboard = () => {
  const navigate = useNavigate();
  const {
    portalAlerts, portalQueue,
    acceptAlert, declineAlert, markFalseAlarm,
    notifyPatient, markServed, advanceQueue, updateTokenStatus,
    userRole, logout, createReferral,
    aiQueuePriority, toggleAiPriority,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'emergencies' | 'queue' | 'analytics'>('queue');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [loadingNotify, setLoadingNotify] = useState<string | null>(null);

  // Zone 1: Live clock (local concern only)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Zone 4: Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Booked' | 'Arrived' | 'InConsultation'>('All');

  // Auth Check
  React.useEffect(() => {
    if (!userRole) {
      navigate('/portal', { replace: true });
    }
  }, [userRole, navigate]);

  // Filter based on new statuses
  const pendingAlerts = portalAlerts.filter(a => a.status === 'pending');
  const acceptedAlerts = portalAlerts.filter(a => a.status === 'accepted');

  // Helper: build NoShowInput from a token
  const buildNoShowInput = (token: typeof portalQueue[0]): NoShowInput => {
    const bookedDate = new Date(token.bookedAt);
    const now = new Date();
    const leadTimeDays = Math.max(0, (now.getTime() - bookedDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      leadTimeDays,
      pastNoShows: token.noShowRisk === 'High' ? 2 : token.noShowRisk === 'Medium' ? 1 : 0,
      pastAttendance: 3,
      hourOfDay: bookedDate.getHours(),
      dayOfWeek: bookedDate.getDay(),
      paymentMethod: token.paymentMethod === 'Online' ? 'Online' : 'Cash',
      isFirstVisit: !token.patientId,
    };
  };

  // AI-sorted queue: Emergency > Urgent > Routine
  const urgencyOrder = { Emergency: 0, Urgent: 1, Routine: 2, undefined: 3 };
  const sortQueue = (tokens: typeof portalQueue) => {
    if (!aiQueuePriority) return tokens;
    return [...tokens].sort((a, b) => {
      const aOrder = urgencyOrder[(a.urgency as keyof typeof urgencyOrder) ?? 'undefined'] ?? 3;
      const bOrder = urgencyOrder[(b.urgency as keyof typeof urgencyOrder) ?? 'undefined'] ?? 3;
      return aOrder - bOrder;
    });
  };

  const waitingTokens = sortQueue(portalQueue.filter(t => t.status === 'Booked'));
  const arrivedTokens = sortQueue(portalQueue.filter(t => t.status === 'Arrived'));
  const inConsultationTokens = portalQueue.filter(t => t.status === 'InConsultation');

  // Zone 4: Combined search + status filter for queue tab
  const allActiveTokens = useMemo(() => {
    let tokens = portalQueue.filter(t => t.status !== 'Completed' && t.status !== 'NoShow');
    if (statusFilter !== 'All') tokens = tokens.filter(t => t.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tokens = tokens.filter(t =>
        (t.patientName || '').toLowerCase().includes(q) ||
        (t.tokenNo || '').toLowerCase().includes(q)
      );
    }
    return sortQueue(tokens);
  }, [portalQueue, statusFilter, searchQuery, aiQueuePriority]);

  // Status counts for filter chips
  const statusCounts = useMemo(() => ({
    All: portalQueue.filter(t => t.status !== 'Completed' && t.status !== 'NoShow').length,
    Booked: waitingTokens.length,
    Arrived: arrivedTokens.length,
    InConsultation: inConsultationTokens.length,
  }), [portalQueue, waitingTokens, arrivedTokens, inConsultationTokens]);

  // Zone 4: Next patient (first arrived, earliest booked)
  const nextPatient = useMemo(() => {
    const arrived = portalQueue.filter(t => t.status === 'Arrived');
    if (arrived.length === 0) return null;
    return arrived.sort((a, b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime())[0];
  }, [portalQueue]);

  // Zone 5: Department load (real data)
  const deptChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    portalQueue.forEach(t => {
      const dept = t.department || 'Unknown';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [portalQueue]);

  // Zone 5: Payment split (real data with fallback)
  const paymentChartData = useMemo(() => {
    const counts: Record<string, number> = { Online: 0, Cash: 0, Card: 0 };
    portalQueue.forEach(t => {
      const method = t.paymentMethod || 'Cash';
      counts[method] = (counts[method] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return [{ name: 'Online', value: 40 }, { name: 'Cash', value: 35 }, { name: 'Card', value: 25 }];
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [portalQueue]);

  // Metrics Logic
  const stats = {
    total: portalQueue.length,
    noShows: portalQueue.filter(t => t.status === 'NoShow').length,
    completed: portalQueue.filter(t => t.status === 'Completed').length,
    onlinePay: Math.round((portalQueue.filter(t => t.paymentStatus === 'Success').length / Math.max(portalQueue.length, 1)) * 100),
    avgWait: Math.round(portalQueue.reduce((acc, t) => acc + (t.waitTimeMinutes || 0), 0) / Math.max(portalQueue.length, 1))
  };

  const handleAccept = (id: string) => {
    acceptAlert(id);
    const alert = portalAlerts.find(a => a.id === id);
    toast.success(`Emergency accepted. ETA: ${alert?.eta} mins. Rescue team notified.`);
  };

  const handleDecline = (id: string) => {
    declineAlert(id);
    toast.warning('Alert declined and redirected to next nearest hospital.');
  };

  const handleFalseAlarm = (id: string) => {
    markFalseAlarm(id);
    toast.info('Marked as false alarm. User notified.');
  };

  const handleCallPatient = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
    toast.info(`Calling ${phone}...`);
  };

  const handleViewMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    toast.info('Opening patient location on Google Maps...');
  };

  const handleNotify = (tokenId: string) => {
    setLoadingNotify(tokenId);
    setTimeout(() => {
      notifyPatient(tokenId);
      setLoadingNotify(null);
      const token = portalQueue.find(t => t.id === tokenId);
      toast.success(`📱 Push notification sent to Token ${token?.tokenNo}! Patient has been notified to leave now.`, {
        duration: 4000,
      });
    }, 800);
  };

  const handleStatusChange = (tokenId: string, status: TokenStatus) => {
    updateTokenStatus(tokenId, status);
    toast.success(`Status updated to ${status}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/portal', { replace: true });
    toast.info('Logged out from staff portal');
  };

  const handleMarkServed = (tokenId: string) => {
    markServed(tokenId);
    const token = portalQueue.find(t => t.id === tokenId);
    toast.success(`Token ${token?.tokenNo} marked as served.`);
  };

  const handleAdvance = (tokenId: string) => {
    advanceQueue(tokenId);
    toast.success('Queue advanced. Position updated.');
  };

  const handleRefer = (token: any) => {
    const dept = prompt('Enter Department for Referral (e.g., Cardiology, ENT):', 'Orthopedic');
    if (dept) {
      createReferral(token, dept, 'Referred for specialist evaluation via Portal');
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-5 pt-5 pb-2 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Staff Dashboard</h1>
            <p className="text-[13px] text-gray-400 font-medium">
              {getGreeting(now)}, {userRole === 'Doctor' ? 'Dr.' : 'Receptionist'} <span className="text-gray-600 mx-1">|</span> <span className="text-gray-300 font-mono tabular-nums">{formatClock(now)}</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* n8n Automation Hub */}
            <button
              onClick={() => navigate('/n8n')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-500/40 bg-orange-950/20 text-orange-400 hover:bg-orange-600 hover:text-white transition-all"
            >
              <span>🔌</span>
              n8n Hub
            </button>

            {/* AI Priority Toggle */}
            <button
              onClick={toggleAiPriority}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                aiQueuePriority
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                  : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}
            >
              <Brain className={`w-3.5 h-3.5 ${aiQueuePriority ? 'animate-pulse' : ''}`} />
              AI {aiQueuePriority ? 'ON' : 'OFF'}
            </button>
            <div className="flex items-center gap-1.5 bg-green-900/30 px-3 py-1 rounded-full border border-green-700/40">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Metrics — 5 cards with top-border accents */}
        <div className="grid grid-cols-5 gap-2.5 mb-6">
          <MetricCard 
            icon={<Users className="w-4 h-4 text-blue-400" />} 
            label="Total" 
            value={stats.total} 
            color="bg-blue-900/40 border-blue-700/50" 
            accentColor="border-t-blue-500"
          />
          <MetricCard 
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} 
            label="Done" 
            value={stats.completed} 
            color="bg-emerald-900/40 border-emerald-700/50" 
            accentColor="border-t-emerald-500"
          />
          <MetricCard 
            icon={<X className="w-4 h-4 text-red-400" />} 
            label="No-Show" 
            value={stats.noShows} 
            color="bg-red-900/40 border-red-700/50" 
            accentColor="border-t-red-500"
          />
          <MetricCard 
            icon={<TrendingUp className="w-4 h-4 text-purple-400" />} 
            label="Online" 
            value={`${stats.onlinePay}%`} 
            color="bg-purple-900/40 border-purple-700/50" 
            accentColor="border-t-purple-500"
          />
          <MetricCard 
            icon={<Timer className="w-4 h-4 text-amber-400" />} 
            label="Avg Wait" 
            value={stats.avgWait > 0 ? `${stats.avgWait}m` : '—'} 
            color="bg-amber-900/40 border-amber-700/50" 
            accentColor="border-t-amber-500"
          />
        </div>

        {/* Tab Selection */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex gap-2 p-1 bg-gray-800 rounded-xl border border-gray-700">
            <button
              onClick={() => setActiveTab('queue')}
              className={`py-2 px-6 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${
                activeTab === 'queue' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" /> Live Queue
            </button>
            <button
              onClick={() => setActiveTab('emergencies')}
              className={`py-2 px-6 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${
                activeTab === 'emergencies' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Emergencies ({pendingAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-6 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${
                activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Analytics
            </button>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors pr-1"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <AnimatePresence mode="wait">
          {/* EMERGENCIES TAB */}
          {activeTab === 'emergencies' && (
            <motion.div
              key="emergencies"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-4 space-y-3"
            >
              {/* Pending */}
              {pendingAlerts.length === 0 && acceptedAlerts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm flex flex-col items-center mt-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-bold text-gray-700 mb-1">No Active Emergencies</p>
                  <p className="text-sm text-gray-400 font-medium">All clear — monitoring for incoming alerts</p>
                </div>
              ) : (
                <>
                  {pendingAlerts.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-2 pl-1">⚡ Requires Action ({pendingAlerts.length})</p>
                      {pendingAlerts.map(alert => (
                        <div key={alert.id} className="bg-white border-2 border-red-200 rounded-2xl overflow-hidden shadow-sm mb-3">
                          <div className="bg-red-50 px-4 py-2.5 border-b border-red-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-600 font-black text-sm">
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              Incoming Emergency
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{formatTime(alert.timestamp)}</span>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Patient</p>
                                <p className="text-sm font-bold text-gray-900">{alert.patientName}</p>
                                <p className="text-xs text-gray-600 font-medium">{alert.patientPhone}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">ETA</p>
                                <p className="text-3xl font-black text-red-600 leading-none">{alert.eta}<span className="text-sm ml-1">min</span></p>
                              </div>
                            </div>

                            {alert.note && (
                              <div className="mb-3 p-2.5 bg-yellow-50 rounded-xl border border-yellow-100">
                                <p className="text-xs text-yellow-800 font-medium">📝 {alert.note}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-500 font-medium">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {alert.area}
                            </div>

                            {/* Expandable details */}
                            <button
                              onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-3"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {expandedAlert === alert.id ? 'Hide Details' : 'View Full Details'}
                              {expandedAlert === alert.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            <AnimatePresence>
                              {expandedAlert === alert.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mb-3 space-y-2"
                                >
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => handleCallPatient(alert.patientPhone)}
                                      className="py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 active:scale-95 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                                    >
                                      <Phone className="w-3.5 h-3.5" /> Call Patient
                                    </button>
                                    <button
                                      onClick={() => handleViewMap(alert.lat, alert.lng)}
                                      className="py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 active:scale-95 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                                    >
                                      <MapPin className="w-3.5 h-3.5" /> View on Map
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => handleAccept(alert.id)}
                                className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black flex items-center justify-center gap-1.5 transition-colors text-xs uppercase tracking-wider shadow-sm shadow-green-500/20 active:scale-95"
                              >
                                <Check className="w-4 h-4" /> Accept
                              </button>
                              <button
                                onClick={() => handleDecline(alert.id)}
                                className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-black flex items-center justify-center gap-1.5 transition-colors text-xs uppercase tracking-wider active:scale-95"
                              >
                                <X className="w-4 h-4" /> Decline
                              </button>
                              <button
                                onClick={() => handleFalseAlarm(alert.id)}
                                className="py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-xl font-black flex items-center justify-center gap-1.5 transition-colors text-[10px] uppercase tracking-wide active:scale-95"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" /> False
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {acceptedAlerts.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-2 pl-1">✅ Accepted ({acceptedAlerts.length})</p>
                      {acceptedAlerts.map(alert => (
                        <div key={alert.id} className="bg-white border border-green-100 rounded-2xl p-4 mb-3 flex items-center justify-between shadow-sm">
                          <div>
                            <p className="font-bold text-sm text-gray-900">{alert.patientPhone}</p>
                            <p className="text-xs text-green-600 font-bold">✓ Accepted • ETA {alert.eta} min • {alert.area}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCallPatient(alert.patientPhone)}
                              className="w-9 h-9 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100 active:scale-95"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleViewMap(alert.lat, alert.lng)}
                              className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 active:scale-95"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* QUEUE TAB (Role Restricted) */}
          {activeTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-3"
            >
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patient name or token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['All', 'Booked', 'Arrived', 'InConsultation'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {status === 'InConsultation' ? 'In Room' : status}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      statusFilter === status ? 'bg-white/20' : 'bg-gray-100'
                    }`}>{statusCounts[status]}</span>
                  </button>
                ))}
              </div>

              {/* Next Patient Banner */}
              {nextPatient && userRole === 'Doctor' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border-l-[3px] border-l-emerald-500 border border-gray-100 p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 font-black text-emerald-700 text-sm">{nextPatient.tokenNo}</div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{nextPatient.patientName || 'Anonymous'}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{nextPatient.department} • Waiting {getTimeSince(nextPatient.bookedAt).text}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStatusChange(nextPatient.id, 'InConsultation')}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5" /> Call Next
                  </button>
                </motion.div>
              )}

              {/* Filtered Token List */}
              {allActiveTokens.length > 0 ? (
                <Section title={`${statusFilter === 'All' ? 'All Active' : statusFilter} Tokens`} tokens={allActiveTokens} role={userRole} onStatus={handleStatusChange} onNotify={handleNotify} loadingNotify={loadingNotify} onRefer={handleRefer} />
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm flex flex-col items-center mt-2">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="font-bold text-gray-700 mb-1">{searchQuery ? 'No Matches' : 'Queue is Empty'}</p>
                  <p className="text-sm text-gray-400 font-medium">{searchQuery ? `No tokens matching "${searchQuery}"` : 'No active tokens for today'}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-5"
            >
              {/* Today's Summary Card */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-indigo-500" /> Today's Summary
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900">{stats.completed}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seen</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-blue-600">{arrivedTokens.length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waiting</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-red-500">{stats.total > 0 ? ((stats.noShows / stats.total) * 100).toFixed(1) : '0'}%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No-Show</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-amber-600">{stats.avgWait > 0 ? `${stats.avgWait}m` : '—'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Wait</p>
                  </div>
                </div>
              </div>

              {/* Hourly Patient Flow — Area Chart (mock data) */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-1 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-teal-500" /> Hourly Patient Flow
                </h3>
                <p className="text-[10px] text-gray-400 font-medium mb-4">Typical daily pattern • 8AM–6PM</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={HOURLY_FLOW_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 700, border: '1px solid #e5e7eb' }} />
                    <Area type="monotone" dataKey="patients" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Department Load — Horizontal Bar Chart (real data) */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-1 flex items-center gap-2 text-sm">
                  <Stethoscope className="w-4 h-4 text-indigo-500" /> Department Load
                </h3>
                <p className="text-[10px] text-gray-400 font-medium mb-4">Live • Bookings per department today</p>
                {deptChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={deptChartData.length * 45 + 20}>
                    <BarChart data={deptChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151', fontWeight: 700 }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 700, border: '1px solid #e5e7eb' }} />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-400 font-medium text-center py-6">No bookings yet today</p>
                )}
              </div>

              {/* Payment Split — Donut Chart (real data + fallback) */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-teal-500" /> Payment Split
                </h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={paymentChartData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} strokeWidth={2} stroke="#fff">
                        {paymentChartData.map((entry) => (
                          <Cell key={entry.name} fill={(PAYMENT_COLORS as any)[entry.name] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 700, border: '1px solid #e5e7eb' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5">
                    {paymentChartData.map(entry => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: (PAYMENT_COLORS as any)[entry.name] || '#94a3b8' }} />
                        <span className="text-xs font-bold text-gray-700">{entry.name}</span>
                        <span className="text-xs font-black text-gray-900">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outbreak Intelligence with pulsing dot */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-emerald-500" /> Outbreak Intelligence
                  <span className="relative flex h-2.5 w-2.5 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </h3>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 mb-2 uppercase tracking-widest">Localized Heatmap: Airoli Sector 8</p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                    Significant spike in "Viral Fever" symptoms detected in the last 48 hours. Nearby pharmacies notified to stock paracetamol.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color, accentColor }: any) => (
  <div className={`p-3 rounded-2xl border border-t-2 ${color} ${accentColor || ''}`}>
    <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
      {icon}
      <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-xl font-black text-white leading-none">{value}</p>
  </div>
);

const Section = ({ title, tokens, role, onStatus, onNotify, loadingNotify, onRefer }: { title: string, tokens: any[], role: any, onStatus: any, onNotify: any, loadingNotify: any, onRefer?: any }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{title} ({tokens.length})</p>
    {tokens.map(token => {
      const noShowPred = NoShowPredictor.predict({
        leadTimeDays: Math.max(0, (Date.now() - new Date(token.bookedAt).getTime()) / (1000 * 60 * 60 * 24)),
        pastNoShows: token.noShowRisk === 'High' ? 2 : token.noShowRisk === 'Medium' ? 1 : 0,
        pastAttendance: 3,
        hourOfDay: new Date(token.bookedAt).getHours(),
        dayOfWeek: new Date(token.bookedAt).getDay(),
        paymentMethod: token.paymentMethod === 'Online' ? 'Online' : 'Cash',
        isFirstVisit: !token.patientId,
      });

      const isHighPriority = token.urgency === 'Emergency' || token.urgency === 'Urgent';
      const timeSince = getTimeSince(token.bookedAt);

      return (
        <div key={token.id} className={`bg-white rounded-3xl border p-4 shadow-sm flex items-center justify-between ${isHighPriority ? 'border-orange-200 shadow-orange-100' : 'border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-black text-sm ${isHighPriority ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
              {token.tokenNo}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="font-black text-gray-900 text-sm leading-tight">{token.patientName || 'Anonymous'}</p>
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${token.paymentStatus === 'Success' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {token.paymentStatus === 'Success' ? 'Paid' : 'Unpaid'}
                </span>
                {isHighPriority && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-0.5 ${token.urgency === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    ⚡ {token.urgency}
                  </span>
                )}
                {noShowPred.risk !== 'Low' && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${noShowPred.risk === 'High' ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                    {noShowPred.risk === 'High' ? '⚠ High Risk' : '~ Med Risk'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 font-bold">{token.department} • {token.age}Y • {token.phone}</p>
                <span className={`text-[9px] font-bold ${
                  timeSince.severity === 'critical' ? 'text-red-500' :
                  timeSince.severity === 'warning' ? 'text-amber-500' : 'text-gray-400'
                }`}>• {timeSince.text}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {role === 'Reception' && token.status === 'Booked' && (
              <button onClick={() => onNotify(token.id)} disabled={loadingNotify === token.id} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                {loadingNotify === token.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              </button>
            )}
            {role === 'Reception' && token.status === 'Booked' && (
              <button onClick={() => onStatus(token.id, 'Arrived')} className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-tighter shadow-sm shadow-emerald-500/20">
                Mark Arrived
              </button>
            )}
            {role === 'Doctor' && token.status === 'Arrived' && (
              <button onClick={() => onStatus(token.id, 'InConsultation')} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-tighter shadow-sm shadow-indigo-600/20">
                Start Call
              </button>
            )}
            {role === 'Doctor' && token.status === 'InConsultation' && (
              <button onClick={() => onStatus(token.id, 'Completed')} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-tighter shadow-sm shadow-emerald-600/20 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> End Visit
              </button>
            )}
            {role === 'Doctor' && onRefer && (token.status === 'InConsultation' || token.status === 'Arrived') && (
              <button onClick={() => onRefer(token)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors" title="Refer to Specialist">
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            {token.status !== 'Completed' && token.status !== 'NoShow' && (
              <button onClick={() => onStatus(token.id, 'NoShow')} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Mark No-Show">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

