import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { motion } from 'motion/react';
import {
  Globe, Bell, BellOff, Shield, Trash2, Info,
  ChevronRight, LogIn, CheckCircle2, Clock, AlertTriangle,
  User, FileText, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { n8nService } from '../services/n8nService';
import { LocationPermissionManager } from '../components/emergency/LocationPermissionManager';

const CONSENT_HISTORY = [
  { id: 'c1', type: 'Emergency', date: 'Today, 10:22 AM', text: 'Location shared with NMMC Hospital Airoli', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'c2', type: 'Appointment', date: 'Yesterday, 2:45 PM', text: 'Token A-12 booked — General Physician', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'c3', type: 'Emergency', date: '3 days ago', text: 'Location shared with Lifeline Hospital', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
];

export const Settings = () => {
  const { language, setLanguage, t } = useLanguage();
  const { notificationsEnabled, setNotificationsEnabled } = useAppState();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [n8nActive, setN8nActive] = useState(false);

  React.useEffect(() => {
    try {
      setN8nActive(n8nService.loadConfig().enabled);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLanguageChange = (lang: 'en' | 'mr' | 'hi') => {
    setLanguage(lang);
    toast.success(`Language changed to ${lang === 'en' ? 'English' : lang === 'mr' ? 'Marathi' : 'Hindi'}`);
  };

  const handleNotificationToggle = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    toast.success(next ? 'Push notifications enabled!' : 'Push notifications disabled.');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    toast.info('Account deletion request submitted. You will receive a confirmation email within 48 hours.', { duration: 5000 });
  };

  const langs = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  ] as const;

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-black text-gray-900">{t('settings')}</h2>
        <p className="text-sm font-medium text-gray-500 mt-0.5">Language, notifications & privacy</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick links */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors active:scale-[0.99]"
          >
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-gray-900 text-sm">My Profile</p>
              <p className="text-xs text-gray-500 font-medium">Personal & medical info, QR code</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => navigate('/records')}
            className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors active:scale-[0.99]"
          >
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-gray-900 text-sm">Medical Records</p>
              <p className="text-xs text-gray-500 font-medium">Prescriptions & lab reports</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => navigate('/feedback')}
            className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors active:scale-[0.99]"
          >
            <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-gray-900 text-sm">Rate Your Visit</p>
              <p className="text-xs text-gray-500 font-medium">Share feedback & reviews</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Language */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">{t('language')}</p>
              <p className="text-xs text-gray-500 font-medium">App display language</p>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {langs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                  language === lang.code
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-gray-50 border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border ${
                    language === lang.code ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                  }`}>
                    {lang.code.toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${language === lang.code ? 'text-blue-800' : 'text-gray-800'}`}>
                      {lang.native}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">{lang.label}</p>
                  </div>
                </div>
                {language === lang.code && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="font-black text-gray-900 text-sm">{t('notifications')}</p>
              <p className="text-xs text-gray-500 font-medium">Token & emergency alerts</p>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: notificationsEnabled ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </button>
          </div>
          <div className="px-5 py-3">
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {notificationsEnabled
                ? '✅ You will receive push notifications when your token is called or there is a status update.'
                : '🔕 Push notifications are disabled. You may miss important token call alerts.'}
            </p>
          </div>
        </section>

        {/* Location Permission Manager */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4">
          <LocationPermissionManager />
        </section>

        {/* Consent History */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">{t('consentHistory')}</p>
              <p className="text-xs text-gray-500 font-medium">Location sharing log</p>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {CONSENT_HISTORY.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.text}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{item.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${item.bg} ${item.color}`}>
                    {item.type}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Portal Access */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => navigate('/portal')}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors active:scale-[0.99]"
          >
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <LogIn className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-gray-900 text-sm">Hospital Staff Portal</p>
              <p className="text-xs text-gray-500 font-medium">Switch to staff dashboard</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </section>

        {/* Integrations */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => navigate('/n8n')}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors active:scale-[0.99]"
          >
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <span className="text-sm">🔌</span>
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <p className="font-black text-gray-900 text-sm">n8n Automation Hub</p>
                <span className={`w-2 h-2 rounded-full ${n8nActive ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-gray-500 font-medium">Configure and test webhook workflows</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </section>

        {/* About */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">{t('aboutApp')}</p>
              <p className="text-xs text-gray-500 font-medium">{t('version')}</p>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              NEo Care is a pilot healthcare app serving the Airoli, Navi Mumbai area. It helps users find nearby hospitals, book appointments, and share live location in emergencies.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['React', 'Tailwind CSS', 'Lucide Icons', 'Motion'].map(tech => (
                <span key={tech} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Delete Account */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-red-100 hover:bg-red-50 transition-colors text-left active:scale-[0.99] shadow-sm"
          >
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-black text-red-600 text-sm">{t('deleteAccount')}</p>
              <p className="text-xs text-gray-500 font-medium">Permanently remove your data</p>
            </div>
            <ChevronRight className="w-5 h-5 text-red-300" />
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 rounded-2xl border-2 border-red-200 p-5"
          >
            <p className="font-black text-red-800 mb-1">Delete Your Account?</p>
            <p className="text-xs text-red-600 font-medium mb-4 leading-relaxed">
              This will permanently delete all your tokens, booking history, and consent logs. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-sm uppercase tracking-wider active:scale-95"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-black text-sm border border-gray-200 uppercase tracking-wider active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
