import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { backendApi } from '../services/backendApi';
import { propertyImages } from '../assets/propertyImages';

export const ForgotPasswordPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setIsLoading(true);
    // POST /auth/forgot-password: Always returns neutral response to prevent user enumeration
    const result = await backendApi.forgotPassword(cleanEmail);
    setIsLoading(false);

    setMessage(result.message);
    if (result.previewToken) {
      setPreviewToken(result.previewToken);
    }
    setSubmitted(true);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold tracking-wider uppercase mb-3 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security &amp; Account Recovery</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md font-serif-display">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-slate-200 drop-shadow-xs">
            Enter your account email address to receive secure reset instructions.
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/45 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-2xl p-6 sm:p-8 text-white">
          {submitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Instructions Dispatched</h3>
              <p className="text-xs text-slate-200 leading-relaxed max-w-xs mx-auto">
                {message}
              </p>

              {/* Dev Simulation: Quick token test link */}
              {previewToken && (
                <div className="mt-3 p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-left">
                  <div className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Development Email Simulation:</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2">
                    In production, this link is delivered via email with a 15-minute expiration token.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('reset-password', previewToken)}
                    className="w-full py-2 px-3 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Test Reset Password Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentPage('sign-in')}
                className="w-full mt-4 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Account Email Address
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Processing request...' : 'Send Password Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('sign-in')}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white pt-2 cursor-pointer transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
