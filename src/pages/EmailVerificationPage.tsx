import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resendVerificationWithBackend, verifyEmailWithBackend } from '../services/authApi';
import { propertyImages } from '../assets/propertyImages';

export const EmailVerificationPage: React.FC = () => {
  const { currentUser, setCurrentUser, setCurrentPage, showNotification, activeRouteToken } = useApp();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Rate limit countdown effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // If token is present in the route URL, auto-verify token from link
  useEffect(() => {
    if (activeRouteToken && activeRouteToken.startsWith('vtok_')) {
      const verifyToken = async () => {
        setIsVerifying(true);
        setStatusMessage({ type: 'info', text: 'Validating email verification link...' });
        const res = await verifyEmailWithBackend({ token: activeRouteToken, email: currentUser.email });
        setIsVerifying(false);

        if (res.success) {
          setCurrentUser({ ...currentUser, emailVerified: true });
          setStatusMessage({ type: 'success', text: res.message || 'Email verified successfully.' });
          showNotification(res.message || 'Email verified successfully.', 'success');
          setTimeout(() => {
            setCurrentPage('seller-dashboard');
          }, 1800);
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'Verification failed.' });
        }
      };
      verifyToken();
    }
  }, [activeRouteToken]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      setStatusMessage({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }

    setIsVerifying(true);
    setStatusMessage(null);

    const res = await verifyEmailWithBackend({
      code: code.trim(),
      email: currentUser.email,
      token: activeRouteToken || undefined
    });

    setIsVerifying(false);

    if (res.success) {
      setCurrentUser({
        ...currentUser,
        emailVerified: true
      });
      setStatusMessage({ type: 'success', text: res.message || 'Email verified successfully.' });
      showNotification('Email verified successfully! Welcome to Sheltered Global.', 'success');
      setTimeout(() => {
        setCurrentPage('seller-dashboard');
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Verification failed.' });
    }
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0 || isResending) return;
    setIsResending(true);
    setStatusMessage(null);

    const res = await resendVerificationWithBackend(currentUser.email);
    setIsResending(false);

    if (res.success) {
      setCooldownSeconds(60);
      setStatusMessage({ type: 'info', text: res.message || 'Verification email resent.' });
      showNotification('Verification email resent. Please check your inbox.', 'info');
    } else {
      if (res.cooldownRemaining) {
        setCooldownSeconds(res.cooldownRemaining);
      }
      setStatusMessage({ type: 'error', text: res.error || 'Failed to resend email.' });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden">
      {/* Background Photography with Ambient Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={propertyImages.authBackground}
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
            We sent a verification link &amp; security code to{' '}
            <span className="font-semibold text-emerald-300">{currentUser.email || 'your email address'}</span>.
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/45 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-2xl p-6 sm:p-8 text-white">
          {statusMessage && (
            <div
              className={`mb-5 p-3.5 rounded-xl border text-xs backdrop-blur-md flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-200'
                  : 'bg-blue-500/20 border-blue-400/50 text-blue-200'
              }`}
            >
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />}
              {statusMessage.type === 'info' && <Clock className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

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
                Click the link in your email or enter the 6-digit confirmation code.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <span>Confirming verification...</span>
              ) : (
                <>
                  <span>Verify Email &amp; Activate Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-4 border-t border-white/15 text-xs">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || cooldownSeconds > 0}
                className={`flex items-center gap-1.5 transition ${
                  cooldownSeconds > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-emerald-300 hover:text-emerald-200 cursor-pointer font-medium'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {cooldownSeconds > 0 ? `Resend available in ${cooldownSeconds}s` : 'Resend Email'}
                </span>
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
            <span>Account Security &amp; Email Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
