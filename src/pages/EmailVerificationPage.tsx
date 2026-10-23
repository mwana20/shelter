import React, { useState } from 'react';
import { Mail, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import authBackground from '../assets/images/auth_background_1792768204016.jpg';

export const EmailVerificationPage: React.FC = () => {
  const { currentUser, setCurrentUser, setCurrentPage, showNotification } = useApp();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      showNotification('Please enter the verification code sent to your email.', 'error');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setCurrentUser({
        ...currentUser,
        emailVerified: true
      });
      showNotification('Email verified successfully! Welcome to Sheltered.', 'success');
      setCurrentPage('seller-dashboard');
    }, 600);
  };

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      showNotification('A new 6-digit verification code has been dispatched to your inbox.', 'info');
    }, 500);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden">
      {/* Background Photography with Ambient Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={authBackground}
          alt="Luxury Architectural Estate"
          className="w-full h-full object-cover object-center scale-102 transition duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/80 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white/10 border border-white/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg backdrop-blur-md">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md font-serif-display">
            Verify Your Email
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-200 drop-shadow-xs">
            We sent a verification code to{' '}
            <span className="font-semibold text-emerald-300">{currentUser.email || 'your email address'}</span>.
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/45 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-2xl p-6 sm:p-8 text-white">
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2 text-center">
                Enter 6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-2xl font-mono py-3 px-4 bg-white/10 border border-white/25 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-semibold transition"
              />
              <p className="text-[11px] text-slate-300 text-center mt-2">
                For development preview, enter any 6 digits (e.g. 582910)
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <span>Verify Email &amp; Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-4 border-t border-white/15 text-xs">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-medium cursor-pointer transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('seller-dashboard')}
                className="text-slate-300 hover:text-white cursor-pointer transition"
              >
                Skip for now
              </button>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-300/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Two-Factor Protection · Sheltered Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
