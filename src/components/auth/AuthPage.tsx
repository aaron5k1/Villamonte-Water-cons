import React, { useState } from 'react';
import { Droplets, Lock, Mail, User, Eye, EyeOff, Sparkles, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../utils/sound';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dailyGoal, setDailyGoal] = useState('2500');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setErrorMessage('Please enter your name.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }
        const res = await register(name, email, password, parseInt(dailyGoal, 10) || 2500);
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed.');
        } else {
          soundManager.playWaterDrop();
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Login failed.');
        } else {
          soundManager.playWaterDrop();
        }
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-100/60 via-slate-50 to-cyan-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-2xl rounded-3xl sm:rounded-[36px] shadow-2xl shadow-sky-500/10 border border-sky-100/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Visual Brand Column (5 cols on md) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Ambient decorative blur */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Water <span className="text-sky-400">cons</span>
                </h1>
                <p className="text-[11px] text-slate-400">Hydration Intelligence</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-black text-white leading-tight">
                Track every drop. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                  Elevate your energy.
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                Log daily water intake with visual bottle waves, scientific goal calculators,
                customizable periodic reminder notifications, and an AI hydration coach.
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="my-8 space-y-3 relative z-10">
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">Fluid Wave Bottle</span>
                <p className="text-[10px] text-slate-400">Live filling animation & volume ticks</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">Periodic Reminders</span>
                <p className="text-[10px] text-slate-400">Audio chimes & customizable intervals</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">Gemini AI Coach</span>
                <p className="text-[10px] text-slate-400">Personalized hydration recommendations</p>
              </div>
            </div>
          </div>

          {/* Security badge */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400 relative z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure local profile encryption</span>
          </div>
        </div>

        {/* Right Form Column (7 cols on md) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                !isRegisterMode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                isRegisterMode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-slate-900">
              {isRegisterMode ? 'Start your hydration journey' : 'Welcome back to Water cons'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isRegisterMode
                ? 'Register your profile to set personal hydration goals'
                : 'Enter your credentials to access your daily water dashboard'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aaron James"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Initial Daily Goal (ml)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1000"
                    max="5000"
                    step="50"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            {!isRegisterMode && (
              <div className="flex items-center text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500"
                  />
                  <span>Remember my session</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
            >
              <span>{isRegisterMode ? 'Create Free Account' : 'Sign In to Water cons'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
