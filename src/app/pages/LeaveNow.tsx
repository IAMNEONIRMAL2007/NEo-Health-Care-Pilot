import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { MOCK_HOSPITALS, MOCK_TOKENS } from '../constants/mockData';
import { motion } from 'motion/react';
import { PhoneCall, CheckCircle2, Navigation2, MapPin, Share2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const LeaveNow = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const locationState = useLocation().state as { tokenId?: string; hospitalId?: string } | null;
  const { userTokens, activeJourney, stopJourney, markServed } = useAppState();

  const tokenId = locationState?.tokenId || activeJourney?.tokenId || '';
  const hospitalId = locationState?.hospitalId || activeJourney?.hospitalId || 'h1';

  const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId) || MOCK_HOSPITALS[0];
  const token = [...userTokens, ...MOCK_TOKENS].find(t => t.id === tokenId);

  const [eta, setEta] = useState(activeJourney?.etaMinutes || hospital.eta);
  const [progress, setProgress] = useState(0);
  const [dotX, setDotX] = useState(18);
  const [dotY, setDotY] = useState(50);

  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
      setProgress(prev => Math.min(100, prev + (100 / (hospital.eta * 2))));
      setDotX(prev => Math.min(prev + 1.5, 65));
      setDotY(prev => {
        const target = 62;
        return prev + (target - prev) * 0.05;
      });
    }, 5000); // Every 5 seconds for demo

    return () => clearInterval(interval);
  }, [hospital.eta]);

  const handleArrived = () => {
    if (token) markServed(token.id);
    stopJourney();
    toast.success('Great! Marked as arrived. Have a safe appointment!', { duration: 4000 });
    navigate('/token');
  };

  const handleCallHospital = () => {
    window.location.href = `tel:${hospital.phone}`;
    toast.info(`Calling ${hospital.shortName}...`);
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}&travelmode=driving`;
    window.open(url, '_blank');
    toast.success('Opening Google Maps...');
  };

  const handleShare = () => {
    const msg = `I'm on my way to ${hospital.name}. ETA: ${eta} mins. Token: ${token?.tokenNo || 'N/A'}`;
    if (navigator.share) {
      navigator.share({ title: 'On my way to hospital', text: msg }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(msg);
      toast.success('ETA message copied!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <div className="relative z-10 px-5 pt-5 pb-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-blue-400 font-black uppercase tracking-widest mb-0.5">{t('liveJourney')}</p>
            <h2 className="text-lg font-black text-white">{t('heading')}</h2>
          </div>
          <div className="flex items-center gap-2 bg-blue-900/40 px-3 py-1.5 rounded-full border border-blue-700/50">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* Hospital info */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="font-black text-white text-base leading-tight mb-1">{hospital.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{hospital.address}</span>
              </div>
              {token && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-lg font-bold border border-indigo-700/50">
                    Token {token.tokenNo}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{token.department}</span>
                </div>
              )}
            </div>
            <div className="bg-blue-950/60 border border-blue-900/50 px-3 py-2 rounded-xl text-center shrink-0">
              <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-0.5">ETA</p>
              <p className="text-3xl font-black text-blue-400 leading-none">{eta}</p>
              <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">{t('etaMins')}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-gray-500 font-medium mb-1">
              <span>Journey Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #6b7280 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        {/* Roads */}
        <div className="absolute top-[50%] left-0 right-0 h-4 bg-gray-700/35 -translate-y-1/2" />
        <div className="absolute top-0 bottom-0 left-[45%] w-3 bg-gray-700/25 -translate-x-1/2" />
        <div className="absolute top-[30%] left-0 right-0 h-2 bg-gray-700/20 rotate-6" />

        {/* Route line */}
        <svg className="absolute inset-0 w-full h-full">
          <line
            x1={`${dotX}%`} y1={`${dotY}%`}
            x2="68%" y2="60%"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeDasharray="8 5"
            opacity="0.6"
          />
        </svg>

        {/* User moving dot */}
        <motion.div
          className="absolute"
          style={{ left: `${dotX}%`, top: `${dotY}%` }}
          animate={{ x: [-2, 2, -1, 1, -2], y: [-1, 0, 1, 0, -1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 bg-blue-500 rounded-full w-8 h-8"
            />
            <div className="w-8 h-8 bg-blue-500 border-4 border-gray-950 rounded-full shadow-lg shadow-blue-500/60 relative z-10 flex items-center justify-center">
              <span className="text-[8px] font-black text-white">🏃</span>
            </div>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-gray-900 text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-gray-700 whitespace-nowrap shadow">
              You ({eta} min)
            </div>
          </div>
        </motion.div>

        {/* Hospital dot */}
        <div className="absolute" style={{ left: '68%', top: '60%' }}>
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <div className="w-9 h-9 bg-red-500 border-4 border-gray-950 rounded-full shadow-lg shadow-red-500/60 flex items-center justify-center z-10">
              <span className="text-[10px] font-black text-white">H</span>
            </div>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-gray-900 text-red-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-gray-700 whitespace-nowrap shadow">
              {hospital.shortName}
            </div>
          </div>
        </div>

        {/* ETA indicator */}
        {eta === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-950/80"
          >
            <div className="text-center">
              <div className="text-5xl mb-3">🏥</div>
              <p className="text-white font-black text-xl">You should be there!</p>
              <p className="text-gray-400 text-sm font-medium mt-1">Tap "Arrived" below</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="relative z-10 p-5 bg-gray-900 border-t border-gray-800 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleCallHospital}
            className="py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition-colors border border-gray-700 active:scale-95"
          >
            <PhoneCall className="w-5 h-5 text-green-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-300">Call</span>
          </button>
          <button
            onClick={handleGetDirections}
            className="py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition-colors border border-gray-700 active:scale-95"
          >
            <Navigation2 className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-300">Maps</span>
          </button>
          <button
            onClick={handleShare}
            className="py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition-colors border border-gray-700 active:scale-95"
          >
            <Share2 className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-300">Share</span>
          </button>
        </div>

        <button
          onClick={handleArrived}
          className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg shadow-green-900/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-6 h-6" />
          {t('arrived')}
        </button>
      </div>
    </div>
  );
};
