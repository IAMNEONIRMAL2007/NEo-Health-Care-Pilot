import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle, Phone, ChevronDown, ChevronUp,
  HelpCircle, Building2, MessageSquare, Shield,
  Navigation, XCircle, CheckCircle2
} from 'lucide-react';
import { MOCK_HOSPITALS, PILOT_SUPPORT_NUMBER, AMBULANCE_NUMBER, FAQ_ITEMS } from '../constants/mockData';
import { toast } from 'sonner';

export const Help = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCall = (number: string, label: string) => {
    window.location.href = `tel:${number.replace(/\s/g, '')}`;
    toast.info(`Calling ${label}...`);
  };

  const handleWhatsApp = (number: string) => {
    const msg = encodeURIComponent('Hi, I need assistance with the Airoli Care app.');
    window.open(`https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-black text-gray-900">{t('help')}</h2>
        <p className="text-sm font-medium text-gray-500 mt-0.5">SOPs, contacts & FAQs</p>
      </div>

      <div className="p-4 space-y-5">
        {/* Emergency SOP */}
        <section className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-5 text-white shadow-lg shadow-red-500/25">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-lg">{t('emergencySOP')}</h3>
          </div>
          <div className="space-y-2">
            {[t('step1'), t('step2'), t('step3'), t('step4'), t('step5')].map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                <span className="text-sm font-black text-red-200 mt-0.5">{i + 1}</span>
                <p className="text-sm font-semibold text-white leading-tight">{step.replace(/^\d\. /, '')}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cancel Alert SOP */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-black text-gray-900 text-sm">{t('cancelAlertGuide')}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['Tap Cancel Alert', '→', 'Wait for confirmation', '→', 'Tap Yes, Cancel'].map((s, i) => (
              <span
                key={i}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                  s === '→' ? 'text-gray-400' : 'bg-yellow-50 text-yellow-800 border border-yellow-100'
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-3 leading-relaxed">
            A 30-second window is provided before cancellation to prevent false alarms. You can choose to cancel, mark as false alarm, or keep the alert active.
          </p>
        </section>

        {/* Emergency Contacts */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-black text-gray-900 text-sm">Emergency Contacts</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Ambulance */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚑</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">National Ambulance</p>
                  <p className="text-xs text-gray-500 font-medium">Free · Available 24/7</p>
                </div>
              </div>
              <button
                onClick={() => handleCall(AMBULANCE_NUMBER, 'National Ambulance 108')}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-black text-sm active:scale-95 shadow-sm shadow-red-600/20"
              >
                <Phone className="w-3.5 h-3.5" /> 108
              </button>
            </div>

            {/* Pilot Support */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t('supportContact')}</p>
                  <p className="text-xs text-gray-500 font-medium">Airoli Pilot Help Desk</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCall(PILOT_SUPPORT_NUMBER, 'Pilot Support')}
                  className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100 active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleWhatsApp(PILOT_SUPPORT_NUMBER)}
                  className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Hospital Contacts */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-black text-gray-900 text-sm">{t('hospitalContacts')}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {MOCK_HOSPITALS.map(hospital => (
              <div key={hospital.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-sm truncate">{hospital.name}</p>
                    {hospital.emergency && (
                      <span className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded shrink-0">ER</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium truncate">{hospital.address}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-yellow-600 font-bold">⭐ {hospital.rating}</span>
                    <span className="text-[10px] text-blue-600 font-bold">🕐 {hospital.eta} min</span>
                    {hospital.ambulance && <span className="text-[10px] text-green-600 font-bold">🚑 Ambulance</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleCall(hospital.phone, hospital.name)}
                  className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100 active:scale-95 shrink-0"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Info */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-black text-gray-900 text-sm">Privacy & Data</h3>
          </div>
          <div className="space-y-2">
            {[
              'Your location is only shared during an active emergency session.',
              'Location data is deleted immediately after the session ends.',
              'Your consent is logged with a timestamp for your records.',
              'We never sell your data to third parties.',
              'Compliant with India\'s Digital Personal Data Protection Act.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600 font-medium leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-black text-gray-900 text-sm">{t('faq')}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <p className="font-bold text-gray-900 text-sm pr-2 leading-tight">{item.q}</p>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-gray-600 font-medium leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
