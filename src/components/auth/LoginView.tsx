import React, { useState } from 'react';
import { 
  Building, 
  Lock, 
  Mail, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { switchUser, settings, isOnline } = useApp();

  const [email, setEmail] = useState('principal@royalcrest.sch.ng');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  const handleQuickLogin = (role: UserRole) => {
    switchUser(role);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background aesthetics */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-sky-900/20 via-blue-950/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 shadow-xl border border-sky-400/30 mb-3">
            <QrCode className="w-9 h-9 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Teacher Attendance OS
          </h1>
          <p className="text-xs font-semibold text-sky-400 mt-1 uppercase tracking-wider">
            {settings.tagline}
          </p>
          <div className="text-xs text-slate-400 mt-0.5">
            {settings.schoolName}
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Quick Demo Access Bar */}
          <div className="mb-6 p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <div className="flex items-center justify-between text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Demo 1-Click Login
              </span>
              <span className="text-[10px] text-slate-400">School Evaluation</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('SCHOOL_ADMIN')}
                className="py-2 px-1 text-[11px] font-bold rounded-xl bg-slate-700/80 hover:bg-sky-600 text-white transition text-center"
              >
                School Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ATTENDANCE_OFFICER')}
                className="py-2 px-1 text-[11px] font-bold rounded-xl bg-slate-700/80 hover:bg-sky-600 text-white transition text-center"
              >
                Kiosk Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('TEACHER')}
                className="py-2 px-1 text-[11px] font-bold rounded-xl bg-slate-700/80 hover:bg-sky-600 text-white transition text-center"
              >
                Teacher
              </button>
            </div>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                School Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-sky-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link sent to registered administrative contact.')}
                className="text-sky-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 transition"
            >
              <span>Login to Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Offline Reassurance Badge */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Local IndexedDB Encrypted • Offline-First PWA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
