import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Building2, Globe, ArrowRight, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { mockAuthService } from '../services/mockAuthService';
import { POPULAR_COUNTRIES } from '../data/mockLocations';

export const RegisterPage: React.FC = () => {
  const { setCurrentPage, setCurrentUser, showNotification, t } = useApp();

  const [role, setRole] = useState<UserRole>('owner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [companyName, setCompanyName] = useState('');
  const [agencyLicense, setAgencyLicense] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError('Please provide your full legal name and email address.');
      return;
    }

    setIsLoading(true);
    const result = await mockAuthService.register({
      name,
      email,
      phone,
      role,
      country,
      companyName: role === 'agent' || role === 'broker' ? companyName : undefined,
      agencyLicense: role === 'agent' || role === 'broker' ? agencyLicense : undefined,
    });
    setIsLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      showNotification('Account successfully created! Please verify your email.', 'success');
      setCurrentPage('email-verification');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
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

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold tracking-wider uppercase mb-3 shadow-sm">
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('brand_name')} Membership</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md font-serif-display">
            {t('create_account_heading')}
          </h2>
          <p className="mt-2 text-sm text-slate-200 drop-shadow-xs">
            {t('create_account_desc')}
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/45 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-2xl p-6 sm:p-8 text-white">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-200 backdrop-blur-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                {t('account_type_label')}:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'owner', label: t('role_seller'), desc: 'Private Seller' },
                  { id: 'landlord', label: 'Landlord', desc: 'Portfolios' },
                  { id: 'agent', label: t('role_agent'), desc: 'Licensed Advisor' },
                  { id: 'buyer', label: t('role_buyer'), desc: 'Investor' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as UserRole)}
                    className={`p-3 text-left border rounded-xl transition-all cursor-pointer backdrop-blur-md ${
                      role === item.id
                        ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-md ring-1 ring-emerald-400/50'
                        : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate text-white">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 ${role === item.id ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  {t('full_name_label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wasswa Emmanuel"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                  />
                </div>
              </div>

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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                  />
                </div>
              </div>
            </div>

            {/* Phone & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  {t('phone_label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 701 000 000"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  {t('country_label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Globe className="w-4 h-4" />
                  </div>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md cursor-pointer transition [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    {POPULAR_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Agency / Company Name if agent or broker */}
            {(role === 'agent' || role === 'broker') && (
              <div className="p-4 bg-white/10 border border-white/15 backdrop-blur-md rounded-xl space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Agency &amp; Brokerage Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Company / Agency Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Elgon Crest Properties"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      License / Board Registration (Optional)
                    </label>
                    <input
                      type="text"
                      value={agencyLicense}
                      onChange={(e) => setAgencyLicense(e.target.value)}
                      placeholder="e.g. UG-REA-2026"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                {t('password_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                />
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="text-xs text-slate-300 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-400"
                />
                <span>
                  {t('agree_terms')}{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentPage('terms')}
                    className="font-medium text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                  >
                    {t('terms_of_service')}
                  </button>{' '}
                  &amp;{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentPage('privacy')}
                    className="font-medium text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                  >
                    {t('privacy_policy')}
                  </button>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>{t('create_account_submit')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-white/15 pt-5 text-center text-xs text-slate-300">
            <span>{t('already_have_account')} </span>
            <button
              type="button"
              onClick={() => setCurrentPage('sign-in')}
              className="font-semibold text-emerald-300 hover:text-emerald-200 hover:underline cursor-pointer transition ml-1"
            >
              {t('nav_sign_in')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
