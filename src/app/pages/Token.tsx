import React from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { MOCK_HOSPITALS, MOCK_TOKENS } from '../constants/mockData';
import { Token } from '../types/token';
import { motion, AnimatePresence } from 'motion/react';
import {
  BellRing, Navigation2, Clock, Building2, MapPin,
  User, Share2, CheckCircle2, AlertCircle, Plus,
  ChevronRight, Phone, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { ClinicChat } from '../components/chat/ClinicChat';
import { FollowUpPrompt } from '../components/ui/FollowUpPrompt';

const statusColors: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  Booked: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-500', label: 'Booked' },
  Arrived: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Arrived' },
  InConsultation: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-500', label: 'In Consultation' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500', label: 'Completed' },
  NoShow: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-400', label: 'No Show' },
};

export const TokenPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { userTokens, startJourney, pendingNotification, clearNotification, isOffline } = useAppState();
  const [activeChat, setActiveChat] = React.useState<{ isOpen: boolean; clinicName: string }>({ 
    isOpen: false, 
    clinicName: '' 
  });

  // Combine user-booked tokens with mock portal demo tokens (to show staff can notify them)
  const allTokens = [...userTokens, ...MOCK_TOKENS].filter(
    (token, index, self) => self.findIndex(t => t.id === token.id) === index
  );

  const activeTokens = allTokens.filter(t => ['Booked', 'Arrived', 'InConsultation'].includes(t.status));
  const pastTokens = allTokens.filter(t => ['Completed', 'NoShow'].includes(t.status));

  const handleLeaveNow = (tokenId: string) => {
    const token = allTokens.find(t => t.id === tokenId);
    if (!token) return;
    const hospital = MOCK_HOSPITALS.find(h => h.id === token.clinicId);
    if (!hospital) return;
    startJourney(tokenId, token.clinicId, hospital.eta);
    clearNotification();
    navigate('/leave-now', { state: { tokenId, hospitalId: token.clinicId } });
  };

  const handleGetDirections = (hospitalId: string) => {
    const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId);
    if (!hospital) return;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
    toast.success('Opening Google Maps...');
  };

  const handleShareETA = (token: Token) => {
    const hospital = MOCK_HOSPITALS.find(h => h.id === token.clinicId);
    const msg = `My hospital appointment token: ${token.tokenNo} at ${token.hospitalName} (${token.department}). Est. wait: ${token.waitTimeMinutes} mins.`;
    if (navigator.share) {
      navigator.share({ title: 'My Token ETA', text: msg }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(msg);
      toast.success('Token details copied to clipboard!');
    }
  };

  const handleCallHospital = (hospitalId: string) => {
    const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId);
    if (!hospital) return;
    window.location.href = `tel:${hospital.phone}`;
    toast.info(`Calling ${hospital.shortName}...`);
  };

  if (allTokens.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 bg-gray-50">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">No Tokens Yet</h3>
        <p className="text-sm text-gray-500 font-medium text-center mb-8 leading-relaxed">
          Book an appointment or get a walk-in token to see it here.
        </p>
        <button
          onClick={() => navigate('/appointments')}
          className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/25 uppercase tracking-wider active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" /> Book Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{t('myTokens')}</h2>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            {activeTokens.length} active • {pastTokens.length} completed
          </p>
        </div>
        <button
          onClick={() => navigate('/appointments')}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs border border-blue-100 active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-500 text-white px-5 py-2 flex items-center gap-2 text-xs font-bold"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Viewing cached data • Some features may be limited</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4">
        {activeTokens.length > 0 && (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Active Tokens</p>
            <div className="space-y-4">
              {activeTokens.map(token => (
                <TokenCard
                  key={token.id}
                  token={token}
                  onLeaveNow={handleLeaveNow}
                  onGetDirections={handleGetDirections}
                  onShareETA={handleShareETA}
                  onCallHospital={handleCallHospital}
                  onChat={(name) => setActiveChat({ isOpen: true, clinicName: name })}
                  highlighted={pendingNotification?.tokenId === token.id || token.status === 'Arrived'}
                />
              ))}
            </div>
          </div>
        )}

        {pastTokens.length > 0 && (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-1 mt-4">Past Tokens</p>
            <div className="space-y-3">
              {pastTokens.map(token => (
                <div key={token.id} className="space-y-3">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm opacity-70">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-gray-700 text-lg">{token.tokenNo}</p>
                        <p className="text-xs text-gray-500 font-medium">{token.department} • {token.hospitalName}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${statusColors[token.status]?.bg || 'bg-gray-50'} ${statusColors[token.status]?.text || 'text-gray-500'}`}>
                        {statusColors[token.status]?.label || token.status}
                      </span>
                    </div>
                  </div>
                  {/* AI Post-Visit Follow-Up Prompt */}
                  <FollowUpPrompt token={token} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ClinicChat 
        isOpen={activeChat.isOpen}
        onClose={() => setActiveChat({ ...activeChat, isOpen: false })}
        clinicName={activeChat.clinicName}
      />
    </div>
  );
};

const TokenCard = ({
  token, onLeaveNow, onGetDirections, onShareETA, onCallHospital, onChat, highlighted
}: {
  token: Token;
  onLeaveNow: (id: string) => void;
  onGetDirections: (hospitalId: string) => void;
  onShareETA: (token: Token) => void;
  onCallHospital: (hospitalId: string) => void;
  highlighted: boolean;
}) => {
  const { t } = useLanguage();
  const cfg = statusColors[token.status] || statusColors.Booked;
  const hospital = MOCK_HOSPITALS.find(h => h.id === token.clinicId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden transition-all ${
        highlighted ? 'border-red-400 shadow-red-100' : `${cfg.border}`
      }`}
    >
      {/* Called notification banner */}
      <AnimatePresence>
        {(token.status === 'Arrived') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 flex items-center gap-3"
          >
            <BellRing className="w-5 h-5 text-white animate-bounce shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm leading-tight">{t('called')}</p>
              <p className="text-red-100 text-xs font-medium truncate">
                Token {token.tokenNo} {t('calledSubtitle')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        {/* Token number + status */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('yourToken')}</p>
            <p className="text-5xl font-black text-indigo-600 tracking-tighter leading-none">{token.tokenNo}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot} ${token.status === 'Booked' || token.status === 'Arrived' ? 'animate-pulse' : ''}`} />
            <span className={`text-xs font-black uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('positionInQueue')}</p>
            <p className="text-2xl font-black text-gray-900">{token.position || '-'}</p>
            <p className="text-[9px] text-gray-400">of {token.totalInQueue || '-'}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
            <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider mb-1">{t('estimatedWait')}</p>
            <p className="text-2xl font-black text-orange-600">{token.waitTimeMinutes}</p>
            <p className="text-[9px] text-orange-400">mins</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</p>
            <p className="text-[11px] font-black text-gray-700">{token.type === 'slot' ? '📅 Slot' : '🚶 Walk-in'}</p>
            {token.appointmentTime && (
              <p className="text-[9px] text-gray-400">{token.appointmentTime}</p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] font-bold text-gray-500">Queue Progress</p>
            <p className="text-[10px] font-bold text-gray-500">
              {token.totalInQueue && token.position 
                ? Math.round(((token.totalInQueue - token.position) / token.totalInQueue) * 100) 
                : 0}%
            </p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${token.totalInQueue && token.position ? ((token.totalInQueue - token.position) / token.totalInQueue) * 100 : 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4 py-3 border-t border-dashed border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-bold">{token.hospitalName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-medium">{token.doctorName} • {token.department}</span>
          </div>
          {hospital && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{hospital.address}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {(token.status === 'Arrived' || token.status === 'InConsultation') && (
          <button
            onClick={() => onLeaveNow(token.id)}
            className="w-full py-4 mb-3 bg-red-600 text-white rounded-2xl font-black text-base uppercase tracking-widest shadow-lg shadow-red-600/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Navigation2 className="w-5 h-5" />
            {t('leaveNow')}
          </button>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onGetDirections(token.clinicId)}
            className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-wide border border-gray-100 hover:border-blue-100 active:scale-95 transition-all"
          >
            <Navigation2 className="w-4 h-4" />
            Directions
          </button>
          <button
            onClick={() => onShareETA(token)}
            className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-xl font-bold text-[10px] uppercase tracking-wide border border-gray-100 hover:border-indigo-100 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share ETA
          </button>
          <button
            onClick={() => onCallHospital(token.clinicId)}
            className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 rounded-xl font-bold text-[10px] uppercase tracking-wide border border-gray-100 hover:border-green-100 active:scale-95 transition-all"
          >
            <Phone className="w-4 h-4" />
            Call
          </button>
        </div>

        <button
          onClick={() => onChat(token.hospitalName)}
          className="w-full mt-3 py-3 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/30 transition-all active:scale-[0.98]"
        >
          <MessageSquare className="w-4 h-4" />
          Chat with Reception
        </button>
      </div>
    </motion.div>
  );
};