import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../constants/translations';
import { motion } from 'motion/react';
import { HeartPulse, ArrowRight, Shield, Bell, MapPin } from 'lucide-react';

const features = [
  { icon: MapPin, label: 'Find nearest hospitals with live ETA' },
  { icon: Shield, label: 'One-tap emergency with location sharing' },
  { icon: Bell, label: 'Get notified when your token is called' },
];

export const Splash = () => {
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Language | null>(null);

  const handleLanguageSelect = (lang: Language) => {
    setSelected(lang);
    setLanguage(lang);
    setTimeout(() => navigate('/home'), 300);
  };

  const langs = [
    { code: 'en' as Language, label: 'English', emoji: '🇬🇧' },
    { code: 'mr' as Language, label: 'मराठी (Marathi)', emoji: '🟠' },
    { code: 'hi' as Language, label: 'हिंदी (Hindi)', emoji: '🇮🇳' },
  ];

  return (
    <div className="flex flex-col flex-1 bg-white relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-[-15%] right-[-20%] w-72 h-72 rounded-full bg-red-50 blur-3xl opacity-80" />
      <div className="absolute bottom-[-10%] left-[-15%] w-80 h-80 rounded-full bg-blue-50 blur-3xl opacity-60" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30 mb-5 relative">
            <div className="absolute inset-0 bg-white/10 rounded-3xl animate-pulse" />
            <HeartPulse className="w-12 h-12 text-white relative z-10" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            NEo <span className="text-red-500">Care</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500 font-medium">Emergency & OPD Scheduling</span>
            <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">PILOT</span>
          </div>
          <p className="text-xs text-gray-400 font-medium mt-1">Airoli, Navi Mumbai</p>
        </motion.div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-xs mb-8 space-y-2.5"
        >
          {features.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                <Icon className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xs font-semibold text-gray-700 leading-tight">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Language selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-xs"
        >
          <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
            Select Language / भाषा निवडा / भाषा चुनें
          </p>

          <div className="space-y-3">
            {langs.map(({ code, label, emoji }) => (
              <motion.button
                key={code}
                onClick={() => handleLanguageSelect(code)}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-4 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3 border-2 ${
                  selected === code
                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/25'
                    : 'bg-white border-gray-200 text-gray-800 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="flex-1 text-left">{label}</span>
                <ArrowRight className={`w-4 h-4 ${selected === code ? 'text-white' : 'text-gray-400'}`} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-5 flex flex-col items-center gap-3">
        <button
          onClick={() => navigate('/portal')}
          className="text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors underline-offset-4 hover:underline"
        >
          Hospital Staff? Login to Portal
        </button>
        <p className="text-[10px] text-gray-300 font-medium">v1.0.0 Pilot · Airoli, Navi Mumbai</p>
      </div>
    </div>
  );
};
