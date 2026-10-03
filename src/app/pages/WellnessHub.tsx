import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppState } from '../contexts/AppStateContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Plus, Activity, Droplets, 
  Moon, Smile, TrendingUp, Info, Scale, 
  Heart, CheckCircle2, History 
} from 'lucide-react';
import { WellnessMetricType } from '../types/wellness';

export const WellnessHub = () => {
  const navigate = useNavigate();
  const { 
    familyMembers, currentPatientId, 
    wellnessLogs, addWellnessLog 
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  const patient = familyMembers.find(m => m.id === currentPatientId) || familyMembers[0];

  // Derive today's metrics
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = wellnessLogs.filter(l => l.timestamp.startsWith(today) && l.patientId === currentPatientId);
  
  const metrics = {
    steps: todayLogs.filter(l => l.type === 'Steps').reduce((acc, l) => acc + l.value, 0),
    water: todayLogs.filter(l => l.type === 'Water').reduce((acc, l) => acc + l.value, 0),
    sleep: todayLogs.filter(l => l.type === 'Sleep').reduce((acc, l) => acc + l.value, 0),
    lastMood: todayLogs.filter(l => l.type === 'Mood').pop()?.note || 'Not set'
  };

  return (
    <div className="flex flex-col flex-1 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-5 pt-6 pb-6 rounded-b-[40px] shadow-lg shadow-emerald-600/20 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black uppercase tracking-widest">Wellness Hub</h1>
            <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest leading-none">Healthy Living • Airoli</p>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl border border-white/20">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 font-black text-lg">
            {patient.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Tracking for</p>
            <p className="font-black text-xl">{patient.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-8">
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
          <button 
            onClick={() => setActiveTab('log')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${
              activeTab === 'log' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
            }`}
          >
            <Plus className="w-4 h-4" /> Log Data
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${
              activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
            }`}
          >
            <History className="w-4 h-4" /> History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'log' ? (
            <motion.div 
              key="log"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pb-12"
            >
              {/* Daily Summary Grid */}
              <div className="grid grid-cols-2 gap-4">
                <MetricCard 
                  icon={<Droplets className="w-5 h-5 text-blue-500" />} 
                  label="Water" value={metrics.water} unit="ml" goal={2000} color="bg-blue-50" 
                />
                <MetricCard 
                  icon={<Activity className="w-5 h-5 text-orange-500" />} 
                  label="Steps" value={metrics.steps} unit="steps" goal={8000} color="bg-orange-50" 
                />
                <MetricCard 
                  icon={<Moon className="w-5 h-5 text-indigo-500" />} 
                  label="Sleep" value={metrics.sleep} unit="hrs" goal={8} color="bg-indigo-50" 
                />
                <MetricCard 
                  icon={<Smile className="w-5 h-5 text-yellow-500" />} 
                  label="Mood" value={metrics.lastMood} unit="" color="bg-yellow-50" 
                />
              </div>

              {/* Logging Actions */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Quick Log</p>
                <div className="grid grid-cols-4 gap-3">
                  <LogAction 
                    icon={<Droplets />} label="+250ml" 
                    onClick={() => addWellnessLog('Water', 250, 'ml')} 
                  />
                  <LogAction 
                    icon={<Droplets />} label="+500ml" 
                    onClick={() => addWellnessLog('Water', 500, 'ml')} 
                  />
                  <LogAction 
                    icon={<Activity />} label="+1k Steps" 
                    onClick={() => addWellnessLog('Steps', 1000, 'steps')} 
                  />
                  <LogAction 
                    icon={<Moon />} label="+1h Sleep" 
                    onClick={() => addWellnessLog('Sleep', 1, 'hrs')} 
                  />
                </div>
              </div>

              {/* Advanced Logs */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pl-1">Clinical Vitals</p>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 active:scale-95 transition-transform">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-bold text-sm text-gray-900">Blood Pressure / BPM</span>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 active:scale-95 transition-transform">
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-sm text-gray-900">Weight & BMI</span>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Note */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  Daily wellness logs are stored on your device and can be shared with your doctor during your next visit.
                </p>
              </div>

            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pb-12"
            >
              {wellnessLogs.length === 0 ? (
                <div className="text-center py-20 px-10">
                  <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="font-bold text-gray-400">No logs yet. Start tracking your health today!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wellnessLogs.slice().sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map((log) => (
                    <div key={log.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          log.type === 'Water' ? 'bg-blue-50 text-blue-500' :
                          log.type === 'Steps' ? 'bg-orange-50 text-orange-500' :
                          log.type === 'Sleep' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-50 text-gray-500'
                        }`}>
                          {log.type === 'Water' ? <Droplets className="w-5 h-5" /> : 
                           log.type === 'Steps' ? <Activity className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-900">{log.type}</p>
                          <p className="text-xs text-gray-400 font-bold">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-base text-gray-900">{log.value} {log.unit}</p>
                        {log.note && <p className="text-[10px] text-emerald-500 font-bold">{log.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, unit, goal, color }: any) => {
  const percentage = goal ? Math.min((value / goal) * 100, 100) : 0;
  
  return (
    <div className={`${color} rounded-3xl p-4 border border-black/5`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="mb-3">
        <p className="text-2xl font-black text-gray-900 leading-none">{value}<span className="text-xs ml-1 opacity-40 uppercase">{unit}</span></p>
        {goal && <p className="text-[9px] font-bold text-gray-400 mt-1">Goal: {goal} {unit}</p>}
      </div>
      {goal && (
        <div className="w-full bg-white/40 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full ${percentage === 100 ? 'bg-emerald-500' : 'bg-gray-900/60'}`}
          />
        </div>
      )}
    </div>
  );
};

const LogAction = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-2xl active:scale-90 transition-transform"
  >
    <div className="text-gray-400">{React.cloneElement(icon, { size: 18 })}</div>
    <span className="text-[10px] font-black text-gray-700 whitespace-nowrap">{label}</span>
  </button>
);
