import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck, ArrowRight, Eye, EyeOff, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAppState } from '../contexts/AppStateContext';

const DEMO_CREDENTIALS = [
  { email: 'reception@neocare.com', password: 'neo123', role: 'Reception', hospital: 'NEo Care Clinic' },
  { email: 'doctor@neocare.com', password: 'neo123', role: 'Doctor', hospital: 'NEo Care Clinic' },
];

export const PortalLogin = () => {
  const navigate = useNavigate();
  const { login, userRole } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (userRole) {
      navigate('/portal/dashboard', { replace: true });
    }
  }, [userRole, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const match = DEMO_CREDENTIALS.find(c => c.email === email && c.password === password);
    if (!match) {
      setError('Invalid credentials. Use the demo accounts below.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(match.email, match.role as 'Doctor' | 'Reception');
      toast.success(`Welcome, ${match.role}!`);
      navigate('/portal/dashboard');
    }, 800);
  };

  const fillCredentials = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setShowHint(false);
    setError('');
  };

  return (
    <div className="flex flex-col flex-1 min-h-full bg-gray-950 justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-96 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 blur-3xl -rotate-12 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-800/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-700 shadow-xl mb-5 relative">
            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur" />
            <ShieldCheck className="w-10 h-10 text-blue-400 relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">Hospital Portal</h1>
          <p className="text-gray-400 text-sm font-medium">NEo Pilot — Authorized Staff Only</p>
        </div>

        {/* Demo hint */}
        <button
          onClick={() => setShowHint(!showHint)}
          className="w-full flex items-center gap-2 px-4 py-3 bg-blue-900/40 border border-blue-700/50 rounded-xl text-blue-300 text-xs font-bold mb-5 hover:bg-blue-900/60 transition-colors"
        >
          <Info className="w-4 h-4 shrink-0" />
          <span>Demo mode: tap to view test credentials</span>
          <ArrowRight className={`w-3.5 h-3.5 ml-auto transition-transform ${showHint ? 'rotate-90' : ''}`} />
        </button>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 space-y-2"
          >
            {DEMO_CREDENTIALS.map((cred, i) => (
              <button
                key={i}
                onClick={() => fillCredentials(cred)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-left hover:border-blue-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-400">{cred.role}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{cred.hospital}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">{cred.email} / {cred.password}</p>
                  </div>
                  <span className="text-[10px] text-blue-500 font-bold mt-1">Use →</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-5 py-4 bg-gray-800/60 border border-gray-700 focus:border-blue-500 rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all font-medium"
              placeholder="staff@nmmc.airoli"
            />
          </div>
          <div className="space-y-1.5">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-5 py-4 bg-gray-800/60 border border-gray-700 focus:border-blue-500 rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all font-medium pr-14"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs font-bold text-center px-2"
            >
              {error}
            </motion.p>
          )}

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-500 accent-blue-500" />
              <span className="text-xs text-gray-400 font-medium">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => toast.info('Contact your hospital admin to reset your password.')}
              className="text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/50 disabled:opacity-70 uppercase tracking-wider text-sm mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Login to Dashboard <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-[10px] text-gray-600 font-medium text-center mt-6 max-w-[260px] mx-auto leading-relaxed">
          This system is for exclusive use of authorized hospital personnel. All activities are logged and audited.
        </p>
      </motion.div>
    </div>
  );
};
