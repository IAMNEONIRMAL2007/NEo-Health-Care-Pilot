import React from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { MOCK_ACTIVITY, MOCK_HOSPITALS } from '../constants/mockData';
import { motion } from 'motion/react';
import {
  Stethoscope, AlertTriangle, Clock, CheckCircle2,
  XCircle, ChevronRight, Navigation2, Phone
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100', label: 'Cancelled' },
  missed: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Missed' },
};

const typeIcon = {
  appointment: Stethoscope,
  emergency: AlertTriangle,
  token: Clock,
};

const typeColor = {
  appointment: 'text-blue-500 bg-blue-50',
  emergency: 'text-red-500 bg-red-50',
  token: 'text-indigo-500 bg-indigo-50',
};

export const Activity = () => {
  const { t } = useLanguage();
  const { userTokens } = useAppState();
  const navigate = useNavigate();

  // Build dynamic activity from user tokens + mock history
  const dynamicActivity = userTokens.map(tk => ({
    id: tk.id,
    type: 'token' as const,
    title: tk.doctorName || 'Doctor',
    subtitle: `${tk.department} • ${tk.hospitalName}`,
    status: tk.status === 'Completed' ? 'completed' as const :
            tk.status === 'NoShow' ? 'missed' as const : 'completed' as const,
    date: new Date(tk.bookedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
  }));

  const allActivity = [...dynamicActivity, ...MOCK_ACTIVITY];

  const handleCallHospital = (name: string) => {
    const hospital = MOCK_HOSPITALS.find(h =>
      name.toLowerCase().includes(h.shortName.toLowerCase()) ||
      h.name.toLowerCase().includes(name.toLowerCase())
    ) || MOCK_HOSPITALS[0];
    window.location.href = `tel:${hospital.phone}`;
    toast.info(`Calling ${hospital.shortName}...`);
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-black text-gray-900">{t('recentActivity')}</h2>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{allActivity.length} total records</p>
      </div>

      {allActivity.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-bold text-gray-700 mb-1">No Activity Yet</p>
          <p className="text-sm text-gray-400 text-center">Your booking and emergency history will appear here.</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {allActivity.map((item, index) => {
            const cfg = statusConfig[item.status];
            const StatusIcon = cfg.icon;
            const TypeIcon = typeIcon[item.type];
            const tColor = typeColor[item.type];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`bg-white rounded-2xl border ${cfg.border} shadow-sm p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tColor}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.title}</p>
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate mb-1">{item.subtitle}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{item.date}</p>
                  </div>
                </div>

                {item.status !== 'missed' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-dashed border-gray-100">
                    <button
                      onClick={() => handleCallHospital(item.subtitle)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100 active:scale-95 transition-colors hover:bg-green-100"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </button>
                    <button
                      onClick={() => navigate('/appointments')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100 active:scale-95 transition-colors hover:bg-blue-100"
                    >
                      <Navigation2 className="w-3.5 h-3.5" /> Book Again <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {item.status === 'missed' && (
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-100">
                    <button
                      onClick={() => navigate('/appointments')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold border border-orange-100 active:scale-95"
                    >
                      Rebook appointment <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
