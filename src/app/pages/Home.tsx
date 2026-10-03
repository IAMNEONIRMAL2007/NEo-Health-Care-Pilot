import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle, Calendar, Clock, ChevronRight,
  Activity, Stethoscope, AlertTriangle, CheckCircle2,
  XCircle, HelpCircle, Settings, MapPin, Navigation2,
  Star, Building2, FileText, User
} from 'lucide-react';
import { MOCK_ACTIVITY, MOCK_HOSPITALS, MOCK_HEALTH_TIPS } from '../constants/mockData';
import { LiveClinicPulse } from '../components/ui/LiveClinicPulse';

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Cancelled' },
  missed: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Missed' },
};

export const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { userTokens, activeEmergency, deviceProfile, userLocation } = useAppState();

  useEffect(() => {
    if (!deviceProfile) {
      navigate('/', { replace: true });
    }
  }, [deviceProfile, navigate]);

  const calledToken = userTokens.find(tk => tk.status === 'Arrived');
  const waitingCount = userTokens.filter(tk => tk.status === 'Booked' || tk.status === 'Arrived').length;

  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);

  useEffect(() => {
    if (userLocation) {
      setIsLoadingHospitals(true);
      fetch(`http://${window.location.hostname}:5000/api/healthcare/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&type=HOSPITAL`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNearbyHospitals(data.data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingHospitals(false));
    }
  }, [userLocation]);

  const nearestHospital = nearbyHospitals.length > 0 ? nearbyHospitals[0] : MOCK_HOSPITALS[0];

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      {/* Header greeting */}
      <div className="bg-white px-6 pt-5 pb-4 border-b border-gray-100">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-1 mb-1">
             <MapPin className="w-3 h-3 text-red-500" />
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{userLocation ? 'Location Active' : 'Location Not Set'}</p>
          </div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            {t('hello')}, {deviceProfile?.displayName || 'Guest'} <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">{t('homeSubtitle')}</p>
        </motion.div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Called token banner */}
        {calledToken && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={() => navigate('/token')}
            className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-red-500/25 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Token {calledToken.tokenNo} Called!</p>
              <p className="text-red-100 text-xs truncate">{calledToken.department} — Please leave now</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 shrink-0" />
          </motion.div>
        )}

        {/* Active emergency banner */}
        {activeEmergency && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate('/emergency-active')}
            className="bg-gray-900 rounded-2xl p-4 flex items-center gap-3 shadow-lg cursor-pointer active:scale-[0.98] transition-transform border border-red-900/50"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0 relative">
              <div className="absolute inset-0 bg-red-500 rounded-xl animate-ping opacity-20" />
              <Navigation2 className="w-5 h-5 text-red-400 relative z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Emergency Active</p>
              <p className="text-gray-400 text-xs">Location is being shared • Tap to view</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
          </motion.div>
        )}

        {/* EMERGENCY BUTTON */}
        <motion.button
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => navigate('/emergency')}
          className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-7 shadow-xl shadow-red-500/35 flex flex-col items-center justify-center transition-transform active:scale-[0.97]"
        >
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-white/5 rounded-full blur-2xl animate-pulse" />
          </div>
          <div className="relative z-10 bg-white/15 border border-white/20 p-4 rounded-full mb-4 shadow-inner">
            <AlertCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="relative z-10 text-3xl font-black text-white uppercase tracking-widest drop-shadow">
            {t('emergencyBtn')}
          </h2>
          <p className="relative z-10 text-red-100 font-semibold text-sm mt-2 tracking-wide text-center">
            Tap · Share location · Get help
          </p>
          <div className="relative z-10 mt-4 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
            <MapPin className="w-3.5 h-3.5 text-red-200" />
            <span className="text-[10px] font-bold text-red-100 uppercase tracking-widest">
               Nearest: {nearestHospital?.name || nearestHospital?.shortName} • {nearestHospital?.calculatedDistance ? Math.round(nearestHospital.calculatedDistance/1000) + ' km' : (nearestHospital?.eta + ' mins')}
            </span>
          </div>
        </motion.button>

        {/* Live Clinic Pulse Widget */}
        <LiveClinicPulse />

        {/* Community Health Feed */}
        <CommunityFeed />

        {/* Nearby Hospitals */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gray-400" />
              Nearby Hospitals
            </h3>
            <span className="text-[10px] font-bold text-gray-400">{nearbyHospitals.length || MOCK_HOSPITALS.length} available</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {isLoadingHospitals ? (
               <div className="text-sm text-gray-500 font-medium">Finding healthcare near you...</div>
            ) : (
              (nearbyHospitals.length > 0 ? nearbyHospitals : MOCK_HOSPITALS).slice(0, 5).map(hospital => (
                <motion.button
                  key={hospital._id || hospital.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/hospital/${hospital._id || hospital.id}`)}
                  className="shrink-0 w-56 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-left flex flex-col justify-between h-28"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" /> {hospital.rating || 4.5}
                    </div>
                    {hospital.emergencyServices && (
                       <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Emergency</span>
                    )}
                  </div>
                  <p className="font-bold text-gray-900 text-xs leading-tight mb-1 line-clamp-2">{hospital.name || hospital.shortName}</p>
                  <p className="text-[10px] text-gray-400 font-medium truncate">
                    {hospital.calculatedDistance ? (hospital.calculatedDistance / 1000).toFixed(1) + ' km' : hospital.distance + ' km'} • {hospital.address ? hospital.address.split(',')[0] : 'Navi Mumbai'}
                  </p>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate('/appointments')}
            className="flex flex-col items-start p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-colors shadow-sm active:scale-[0.98]"
          >
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-500 mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 text-sm leading-tight">{t('bookAppointment')}</span>
            <span className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1">
              Slots available <ChevronRight className="w-3 h-3" />
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate('/token')}
            className="flex flex-col items-start p-4 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border border-indigo-100 transition-colors shadow-sm active:scale-[0.98]"
          >
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-indigo-500 mb-3 relative">
              <Clock className="w-5 h-5" />
              {waitingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                  {waitingCount}
                </span>
              )}
            </div>
            <span className="font-bold text-gray-900 text-sm leading-tight">{t('myTokens')}</span>
            <span className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1">
              {waitingCount > 0 ? `${waitingCount} active` : 'View queue'} <ChevronRight className="w-3 h-3" />
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/help')}
            className="flex flex-col items-start p-4 bg-green-50 hover:bg-green-100 rounded-2xl border border-green-100 transition-colors shadow-sm active:scale-[0.98]"
          >
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-green-500 mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 text-sm leading-tight">{t('help')}</span>
            <span className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1">
              SOPs & Contacts <ChevronRight className="w-3 h-3" />
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => navigate('/settings')}
            className="flex flex-col items-start p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-colors shadow-sm active:scale-[0.98]"
          >
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-500 mb-3">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 text-sm leading-tight">{t('settings')}</span>
            <span className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1">
              Language & prefs <ChevronRight className="w-3 h-3" />
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/wellness')}
            className="col-span-2 flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform text-white group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-xl border border-white/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block font-black text-sm uppercase tracking-wider">Wellness Hub</span>
                <span className="block text-[11px] font-medium text-emerald-100">Log vitals & track family health</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </motion.button>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-gray-400" />
              {t('recentActivity')}
            </h3>
            <button
              onClick={() => navigate('/activity')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {t('seeAll')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {MOCK_ACTIVITY.slice(0, 3).map((item) => {
              const cfg = statusConfig[item.status];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{item.title}</p>
                      <p className="text-[11px] font-medium text-gray-500">{item.subtitle}</p>
                      <p className="text-[10px] font-medium text-gray-400 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color} rounded-lg whitespace-nowrap`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ── Community Health Feed ──
const CommunityFeed = () => {
  const navigate = useNavigate();
  const { communityAlerts } = useAppState();
  const [current, setCurrent] = useState(0);

  const items = [...communityAlerts, ...MOCK_HEALTH_TIPS.map(tip => ({
    id: tip.id,
    type: 'Community',
    severity: 'Low',
    title: tip.title,
    message: tip.subtitle,
    isTip: true,
    color: tip.color,
    emoji: tip.emoji,
    textColor: tip.textColor
  }))];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const item = items[current] as any;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-emerald-500" />
          {item.isTip ? 'Health Daily' : 'Community Alert'}
        </h3>
        {!item.isTip && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
            item.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
          }`}>
            {item.severity} Priority
          </span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl min-h-[100px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`p-5 rounded-3xl flex flex-col gap-4 shadow-sm border ${
              item.isTip 
                ? `bg-gradient-to-r ${item.color} border-transparent` 
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl shrink-0">
                {item.emoji || (item.type === 'Weather' ? '🌩️' : item.type === 'Outbreak' ? '😷' : '📢')}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-base leading-tight mb-1 ${item.isTip ? item.textColor : 'text-gray-900'}`}>
                  {item.title}
                </p>
                <p className={`text-xs font-medium leading-relaxed ${item.isTip ? `${item.textColor} opacity-80` : 'text-gray-500'}`}>
                  {item.message}
                </p>
              </div>
            </div>

            {item.actionLabel && (
              <button 
                onClick={() => item.actionLink && navigate(item.actionLink)}
                className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                  item.isTip 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : item.severity === 'High' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-blue-50 text-blue-600'
                }`}
              >
                {item.actionLabel}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-5 h-1.5 bg-gray-900' : 'w-1.5 h-1.5 bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
