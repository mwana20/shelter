import React, { useState, useMemo } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { backendApi, validatePasswordStrength } from '../services/backendApi';

export const ResetPasswordPage: React.FC = () => {
  const { setCurrentPage, showNotification, activeRouteToken } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // If no token is provided in the URL route
  const hasToken = !!activeRouteToken;

  const pwStrength = useMemo(() => {
    return validatePasswordStrength(newPassword);
  }, [newPassword]);

  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeRouteToken) {
      setError('Missing security reset token. Please request a new password reset link.');
      return;
    }

    if (!pwStrength.isValid) {
      setError(pwStrength.errorMessage || 'Please ensure your new password satisfies all security criteria.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsLoading(true);

    try {
      // POST /auth/reset-password
      const res = await backendApi.resetPassword({
        token: activeRouteToken,
        newPassword,
        confirmPassword
      });

      setIsLoading(false);

      if (res.success) {
        setIsSuccess(true);
        showNotification(res.message || 'Password reset successfully. Redirecting to login...', 'success');
        setTimeout(() => {
          setCurrentPage('sign-in');
        }, 2200);
      } else {
        setError(res.error || 'Failed to reset password. Please request a new reset link.');
      }
    } catch {
      setIsLoading(false);
      setError('A network error occurred while communicating with the authentication server.');
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

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold tracking-wider uppercase mb-3 shadow-sm">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Password Update</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md font-serif-display">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-slate-200 drop-shadow-xs">
            Create a strong, unique password to protect your real estate account.
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/45 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-2xl p-6 sm:p-8 text-white">
          {!hasToken ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-rose-500/20 border border-rose-400/40 text-rose-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Invalid or Missing Reset Token</h3>
              <p className="text-xs text-slate-200 leading-relaxed max-w-xs mx-auto">
                No active password reset token was detected in your link, or the link may have expired.
              </p>
              <button
                type="button"
                onClick={() => setCurrentPage('forgot-password')}
                className="w-full mt-4 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
              >
                Request New Password Reset Link
              </button>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Password Updated Successfully</h3>
              <p className="text-xs text-slate-200 leading-relaxed max-w-xs mx-auto">
                Your new password is now active. Your previous password has been invalidated. Redirecting you to sign in...
              </p>
              <button
                type="button"
                onClick={() => setCurrentPage('sign-in')}
                className="w-full mt-4 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
              >
                Proceed to Sign In Now
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/25 border border-rose-400/50 text-xs text-rose-200 backdrop-blur-md flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    New Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters..."
                      className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Confirm New Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Real-time Checklist */}
                {newPassword.length > 0 && (
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-white/15 space-y-2 text-xs">
                    <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
                      Requirements:
                    </span>
                    <div className="grid grid-cols-1 gap-1 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${pwStrength.hasMinLength ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {pwStrength.hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${pwStrength.hasUppercase ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {pwStrength.hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>At least 1 uppercase letter (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${pwStrength.hasLowercase ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {pwStrength.hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>At least 1 lowercase letter (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${pwStrength.hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {pwStrength.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>At least 1 numeric digit (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${pwStrength.hasSpecialChar ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {pwStrength.hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>At least 1 special character (!@#$%)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>Passwords match</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Updating password...</span>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-300/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Time-Limited Token · Single-Use Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
