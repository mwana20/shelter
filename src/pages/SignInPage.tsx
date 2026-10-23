import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockAuthService } from '../services/mockAuthService';

export const SignInPage: React.FC = () => {
  const { setCurrentPage, setCurrentUser, showNotification, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please provide your account email address.');
      return;
    }

    setIsLoading(true);
    const result = await mockAuthService.login(email, password);
    setIsLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      showNotification(`Welcome back, ${result.user.name}!`, 'success');
      setCurrentPage('seller-dashboard');
    } else {
      setError(result.error || 'Failed to sign in.');
    }
  };

  const handleQuickDemoLogin = (role: 'agent' | 'owner' | 'buyer') => {
    const demoEmails = {
      agent: 'michael.kato@shelteredglobal.com',
      owner: 'landlord.paul@shelteredglobal.com',
      buyer: 'claire.investor@gmail.com'
    };
    setEmail(demoEmails[role]);
    setPassword('ShelteredGlobal2026!');
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden">
      {/* Background Photography with Ambient Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/auth_background_1792768204016.jpg"
          alt="Luxury Architectural Estate"
          className="w-full h-full object-cover object-center scale-102 transition duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/80 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header Title with Crisp Contrast */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold tracking-wider uppercase mb-3 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('brand_name')} {t('brand_tagline')}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md font-serif-display">
            {t('sign_in_heading')}
          </h2>
          <p className="mt-2 text-sm text-slate-200 drop-shadow-xs">
            {t('sign_in_desc')}
          </p>
        </div>

        {/* Demo Quick-Fill Bar */}
        <div className="mb-6 p-3.5 bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl text-xs text-slate-200 shadow-xl">
          <div className="flex items-center gap-1.5 font-semibold text-white mb-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Fast Preview Demo Account:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('agent')}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-[11px] font-medium text-white transition cursor-pointer shadow-xs"
            >
              {t('role_agent')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('owner')}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-[11px] font-medium text-white transition cursor-pointer shadow-xs"
            >
              {t('role_seller')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('buyer')}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-[11px] font-medium text-white transition cursor-pointer shadow-xs"
            >
              {t('role_buyer')}
            </button>
          </div>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/45 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-2xl p-6 sm:p-8 text-white">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-200 backdrop-blur-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                {t('email_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  {t('password_label')}
                </label>
                <button
                  type="button"
                  onClick={() => setCurrentPage('forgot-password')}
                  className="text-xs text-emerald-300 hover:text-emerald-200 font-medium cursor-pointer transition"
                >
                  {t('forgot_password')}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white cursor-pointer transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-400"
                />
                <span>{t('remember_me')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>{t('sign_in_submit')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-white/15 pt-5 text-center text-xs text-slate-300">
            <span>{t('dont_have_account')} </span>
            <button
              type="button"
              onClick={() => setCurrentPage('create-account')}
              className="font-semibold text-emerald-300 hover:text-emerald-200 hover:underline cursor-pointer transition ml-1"
            >
              {t('nav_create_account')}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-300/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Authentication · Sheltered Global</span>
          </div>
        </div>
      </div>
    </div>
  );
};
