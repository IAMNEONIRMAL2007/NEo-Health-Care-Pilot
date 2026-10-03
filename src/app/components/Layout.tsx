import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { ChevronLeft, LogOut, Home, Stethoscope, Clock, Settings, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Layout = () => {
  const { language, setLanguage, t } = useLanguage();
  const { userTokens, pendingNotification, clearNotification, isOffline, familyMembers, currentPatientId, setCurrentPatientId } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  const isPortal = location.pathname.startsWith('/portal');
  const isSplash = location.pathname === '/';
  const isEmergencyActive = location.pathname === '/emergency-active';
  const isLeaveNow = location.pathname === '/leave-now';
  const showBack = !isSplash && location.pathname !== '/home' && location.pathname !== '/portal/dashboard';
  const hideBottomNav = isEmergencyActive || isLeaveNow;

  const calledTokens = userTokens.filter(t => t.status === 'Arrived').length;
  const waitingTokens = userTokens.filter(t => t.status === 'Booked').length;
  const totalActiveTokens = calledTokens + waitingTokens;

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/appointments', label: 'Book', icon: Stethoscope },
    { path: '/token', label: 'Tokens', icon: Clock, badge: totalActiveTokens },
    { path: '/settings', label: 'More', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Push notification banner */}
      <AnimatePresence>
        {pendingNotification && !isSplash && !isPortal && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center pointer-events-none"
          >
            <div className="mx-4 mt-4 max-w-md w-full bg-red-600 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 pointer-events-auto"
              style={{ maxWidth: 440 }}
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">Token {pendingNotification.tokenNo} Called!</p>
                <p className="text-red-100 text-xs truncate">{pendingNotification.department} — Please head to hospital now</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { clearNotification(); navigate('/token'); }}
                  className="bg-white text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                >
                  View
                </button>
                <button
                  onClick={clearNotification}
                  className="text-white/70 text-xs font-medium px-2 py-1.5 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSplash && (
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center">
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="mr-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h1 className="font-black text-lg tracking-tight flex items-center gap-1.5">
                <span className="text-red-500">NEo</span>
                <span className="text-gray-900">{isPortal ? 'Portal' : 'Care'}</span>
                {!isPortal && (
                  <span className="ml-1 text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    Pilot
                    {isOffline && (
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                    )}
                  </span>
                )}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {!isPortal && !isSplash && (
                <div className="flex items-center gap-1.5">
                  <select
                    value={currentPatientId}
                    onChange={(e) => {
                      if (e.target.value === 'manage') {
                        navigate('/family');
                      } else {
                        setCurrentPatientId(e.target.value);
                      }
                    }}
                    className="text-[11px] bg-red-50 border-none rounded-lg px-2 py-1.5 outline-none font-black text-red-600 cursor-pointer shadow-sm"
                  >
                    {familyMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name.split(' ')[0]}</option>
                    ))}
                    <option value="manage">+ Manage</option>
                  </select>
                </div>
              )}
              {isPortal && location.pathname !== '/portal' && (
                <button
                  onClick={() => navigate('/portal')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 text-xs font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
              {!isPortal && !isSplash && (
                 <button
                  onClick={() => navigate('/settings')}
                  className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 overflow-hidden"
                >
                   {familyMembers.find(m => m.id === currentPatientId)?.avatar || '👤'}
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <main
        className="flex-1 w-full max-w-md mx-auto bg-white relative"
        style={{ overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}
      >
        <Outlet />
      </main>

      {!isSplash && !isPortal && !hideBottomNav && (
        <nav className="bg-white border-t border-gray-100 sticky bottom-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
            {navItems.map(({ path, label, icon: Icon, badge }) => {
              const active = location.pathname === path || (path === '/token' && location.pathname === '/leave-now');
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all relative ${
                    active ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                    {badge != null && badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold transition-colors ${active ? 'text-red-500' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 w-8 h-0.5 bg-red-500 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};
