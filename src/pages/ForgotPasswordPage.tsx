import React, { useRef, useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  requestPasswordResetWithBackend,
  verifyPasswordResetCodeWithBackend
} from '../services/authApi';
import { propertyImages } from '../assets/propertyImages';

export const ForgotPasswordPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const codeInputs = useRef<Array<HTMLInputElement | null>>([]);
  const verificationInFlight = useRef(false);

  const verifyCode = async (value: string) => {
    if (verificationInFlight.current || !/^\d{6}$/.test(value)) return;
    verificationInFlight.current = true;
    setIsVerifying(true);
    setRequestError('');

    try {
      const result = await verifyPasswordResetCodeWithBackend(email, value);
      if (result.success && result.resetToken) {
        setCurrentPage('reset-password', result.resetToken);
      } else {
        setRequestError(result.error || 'That code is invalid or expired. Please try again.');
      }
    } finally {
      verificationInFlight.current = false;
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setIsLoading(true);
    setRequestError('');
    try {
      const result = await requestPasswordResetWithBackend(cleanEmail);
      if (!result.success) {
        setRequestError(result.error || 'We could not send the password reset email. Please try again later.');
        return;
      }

      setMessage(result.message || 'If this email is registered, a password reset code has been sent.');
      if (result.previewCode) {
        setPreviewCode(result.previewCode);
      }
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCode = (index: number, digit: string) => {
    const nextCode = Array.from({ length: 6 }, (_, position) =>
      position === index ? digit : code[position] || ''
    ).join('');
    setCode(nextCode);
    setRequestError('');
    if (digit && index < 5) codeInputs.current[index + 1]?.focus();
    if (/^\d{6}$/.test(nextCode)) void verifyCode(nextCode);
  };

  const handleCodeChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 1) {
      const pastedCode = digits.slice(0, 6);
      setCode(pastedCode);
      setRequestError('');
      codeInputs.current[Math.min(pastedCode.length, 5)]?.focus();
      if (/^\d{6}$/.test(pastedCode)) void verifyCode(pastedCode);
      return;
    }
    updateCode(index, digits.slice(-1));
  };

  const handleCodePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedCode = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedCode) return;
    setCode(pastedCode);
    setRequestError('');
    codeInputs.current[Math.min(pastedCode.length, 5)]?.focus();
    if (pastedCode.length === 6) void verifyCode(pastedCode);
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
                {isVerifying ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-100/30 border-t-emerald-300" /> : <CheckCircle2 className="w-7 h-7" />}
              </div>
              <h3 className="text-lg font-bold text-white">Enter Your Reset Code</h3>
              <p className="text-xs text-slate-200 leading-relaxed max-w-xs mx-auto">
                {message} Enter the 6-digit code sent to <span className="font-semibold text-emerald-300">{email}</span>.
              </p>

              {previewCode && (
                <div className="mt-3 p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-left">
                  <div className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Development Email Simulation:</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2">
                    Use this code for local testing. In production, the code is delivered by email.
                  </p>
                  <p className="text-center font-mono text-lg font-bold tracking-[0.4em] text-white">{previewCode}</p>
                </div>
              )}

              {requestError && (
                <p role="alert" className="rounded-lg border border-red-300/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                  {requestError}
                </p>
              )}
              <div className="flex justify-center gap-2" aria-label="6-digit password reset code">
                {Array.from({ length: 6 }, (_, index) => (
                  <input
                    key={index}
                    ref={(element) => { codeInputs.current[index] = element; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Code digit ${index + 1}`}
                    maxLength={1}
                    value={code[index] || ''}
                    disabled={isVerifying}
                    onChange={(event) => handleCodeChange(index, event.target.value)}
                    onPaste={handleCodePaste}
                    onKeyDown={(event) => {
                      if (event.key === 'Backspace' && !code[index] && index > 0) {
                        codeInputs.current[index - 1]?.focus();
                      } else if (event.key === 'ArrowLeft' && index > 0) {
                        codeInputs.current[index - 1]?.focus();
                      } else if (event.key === 'ArrowRight' && index < 5) {
                        codeInputs.current[index + 1]?.focus();
                      }
                    }}
                    className="h-12 w-11 rounded-xl border border-white/25 bg-white/10 text-center font-mono text-xl font-bold text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-300">
                {isVerifying ? 'Verifying your code...' : 'Verification starts automatically when all digits are entered.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setCode('');
                  setRequestError('');
                  setPreviewCode(null);
                }}
                className="w-full mt-2 py-3 px-4 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> Change email address</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {requestError && (
                <p role="alert" className="rounded-lg border border-red-300/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                  {requestError}
                </p>
              )}
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
                {isLoading ? 'Sending code...' : 'Send Verification Code'}
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
