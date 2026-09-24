// frontend/src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import {
  Plane,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Building,
  TrendingUp,
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('employee@travelops.demo');
  const [password, setPassword] = useState('TravelOps@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleSelectDemo = (acc) => {
    setEmail(acc.email);
    setPassword('TravelOps@2026');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left: Brand Presentation & Value Prop */}
        <div className="lg:col-span-6 space-y-6 text-white p-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="TravelOps Logo"
              className="w-14 h-14 rounded-2xl object-cover shadow-xl shadow-brand-500/30 border border-white/20"
            />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight font-display">
                Travel<span className="text-sky-400">Ops</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Corporate Travel & Expense Cloud</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight font-display">
              Enterprise travel, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-brand-300">
                streamlined end-to-end.
              </span>
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Automated policy validations, multi-tier manager approvals, concierge booking, receipts audit, and instant reimbursements.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-sky-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Automated live policy check (Hotel, Flights & Per-Diem caps)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-sky-400 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span>Real-time budget tracking & expense fraud protection</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-sky-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Multi-level role-based approval workflows</span>
            </div>
          </div>
        </div>

        {/* Right: Login Card with 1-Click Role Switcher */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-modal border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-slate-900 font-display">
              Sign in to TravelOps
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a demo role below or enter enterprise credentials.
            </p>
          </div>

          {/* 1-Click Demo Accounts */}
          <div className="mb-5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 font-display mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Demo Personas (One-Click)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`p-2 rounded-xl text-left border transition-all text-xs ${
                    email === acc.email
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-bold truncate text-[11px]">{acc.label}</p>
                  <p className={`text-[10px] truncate ${email === acc.email ? 'text-brand-100' : 'text-slate-400'}`}>
                    {acc.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Remember this device
              </label>
              <a href="#" className="font-semibold text-brand-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-brand-500/30"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
