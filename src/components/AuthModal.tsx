import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { companySettings } from '../config/company';

const policyVersion = '2026-10-16-en-v1';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, currentUser, setCurrentUser, showNotification, setCurrentPage } = useApp();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'buyer' | 'landlord' | 'agent'>('buyer');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companySettings.authApiUrl) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${companySettings.authApiUrl}/api/auth/${mode}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'register'
          ? {
              name,
              email,
              phone,
              role,
              password,
              acceptedTerms: acceptedPolicies,
              acknowledgedPrivacy: acceptedPolicies,
              policyVersion,
              acceptedAt: new Date().toISOString(),
              language: 'en'
            }
          : { email, password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === 'string' ? result.message : 'Authentication failed.');

      if (mode === 'register') {
        showNotification('Account created. Complete email verification before signing in.', 'success');
      } else if (result.emailVerified === true && result.user) {
        setCurrentUser(result.user);
        showNotification('Signed in successfully.', 'success');
      } else {
        throw new Error('Verify your email before signing in.');
      }
      setAuthModalOpen(false);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Authentication failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure account</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900">
            {mode === 'signin' ? 'Sign In to Sheltered' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Account access requires the marketplace authentication service.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-lg bg-neutral-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
              mode === 'signin' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
              mode === 'register' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {mode === 'register' && <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>}

          {mode === 'register' && <label className="flex items-start gap-2 text-xs leading-5 text-neutral-600">
            <input
              type="checkbox"
              required
              checked={acceptedPolicies}
              onChange={(event) => setAcceptedPolicies(event.target.checked)}
              className="mt-1 accent-emerald-800"
            />
            <span>
              I accept the{' '}
              <button type="button" className="font-semibold text-emerald-800 underline" onClick={() => { setCurrentPage('terms'); setAuthModalOpen(false); }}>Terms of Service</button>
              {' '}and acknowledge the{' '}
              <button type="button" className="font-semibold text-emerald-800 underline" onClick={() => { setCurrentPage('privacy'); setAuthModalOpen(false); }}>Privacy Policy</button>
              {' '}(English, version 1).
            </span>
          </label>}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 7XX XXX XXX"
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {mode === 'register' && <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'buyer' | 'landlord' | 'agent')}
              className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="buyer">Home Hunter / Tenant</option>
              <option value="landlord">Property Owner / Landlord</option>
              <option value="agent">Licensed Property Broker</option>
            </select>
          </div>}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                  minLength={12}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!companySettings.authApiUrl || isSubmitting || mode === 'register' && !acceptedPolicies}
            className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white text-xs font-bold py-3 rounded-xl transition shadow-md mt-2"
          >
            {!companySettings.authApiUrl ? 'Authentication service not configured' : isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign In to Account' : 'Create Account'}
          </button>
          {!companySettings.authApiUrl && <p className="text-xs text-neutral-500" role="status">Account registration and sign-in are unavailable until a secure backend is configured.</p>}
        </form>
      </div>
    </div>
  );
};
