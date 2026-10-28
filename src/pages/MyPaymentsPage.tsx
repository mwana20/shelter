import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationUnlockPayment } from '../types';
import { backendApi } from '../services/backendApi';

export const MyPaymentsPage: React.FC = () => {
  const { currentUser, setCurrentPage, openPropertyDetail, showNotification } = useApp();
  const [payments, setPayments] = useState<LocationUnlockPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  // New transaction submission modal/dialog if previous was rejected
  const [resubmitTarget, setResubmitTarget] = useState<LocationUnlockPayment | null>(null);
  const [newTxId, setNewTxId] = useState('');
  const [isSubmittingNewTx, setIsSubmittingNewTx] = useState(false);
  const [resubmitError, setResubmitError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await backendApi.getMyPayments(currentUser.id);
      setPayments(data);
    } catch {
      setError('Failed to fetch payment records from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentUser.id]);

  const handleCheckStatus = async (payment: LocationUnlockPayment) => {
    setCheckingId(payment.id);
    const lookupKey = payment.submittedTransactionId || payment.gatewayReference || payment.id;
    const res = await backendApi.getPaymentStatus(lookupKey);
    setCheckingId(null);

    if (res.payment) {
      setPayments((prev) =>
        prev.map((p) => (p.id === payment.id ? { ...p, ...res.payment! } : p))
      );
      if (res.payment.status === 'verified') {
        showNotification('Payment verified! Exact location is unlocked.', 'success');
      } else if (res.payment.status === 'rejected') {
        showNotification(`Payment rejected: ${res.payment.rejectionReason || 'Verification failed.'}`, 'error');
      } else {
        showNotification('Payment is still in review by administrator.', 'info');
      }
    } else {
      showNotification('Could not refresh status at this time.', 'info');
    }
  };

  const handleResubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitTarget || !newTxId.trim()) return;

    setIsSubmittingNewTx(true);
    setResubmitError(null);

    const res = await backendApi.submitMerchantTransaction({
      propertyId: resubmitTarget.propertyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      transactionId: newTxId.trim()
    });

    setIsSubmittingNewTx(false);

    if (res.success) {
      showNotification(res.message, 'success');
      setResubmitTarget(null);
      setNewTxId('');
      fetchPayments();
    } else {
      setResubmitError(res.error || 'Failed to submit new transaction ID.');
    }
  };

  const getStatusBadge = (status: LocationUnlockPayment['status']) => {
    switch (status) {
      case 'verified':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified / Unlocked</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case 'duplicate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Duplicate Tx</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <CreditCard className="w-4 h-4" />
              <span>Location Unlock Receipts &amp; Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">
              My Payments &amp; Unlocks
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Track your payment transactions, verification receipts, and unlocked property coordinates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPayments}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-4 rounded-xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Payment Records Section */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/90 shadow-xs space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-neutral-700">Loading payment ledger from server...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 rounded-3xl p-8 text-center border border-rose-200 text-rose-800 space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-600" />
            <p className="text-sm font-bold">{error}</p>
            <button
              onClick={fetchPayments}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
            >
              Retry Loading
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/90 shadow-xs space-y-4">
            <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
              No Payment Transactions Yet
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              When you pay to unlock exact property coordinates or cadastral boundaries, your payment receipts and status verification will be recorded here.
            </p>
            <button
              onClick={() => setCurrentPage('search')}
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              Browse Property Listings
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 truncate max-w-sm">
                        {payment.propertyTitle}
                      </span>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Submitted on{' '}
                      {new Date(payment.submissionDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-neutral-950">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </span>
                    <span className="block text-[11px] font-semibold text-neutral-500 uppercase">
                      {payment.paymentMethod === 'MERCHANT_CODE'
                        ? 'Merchant Code Payment'
                        : payment.paymentMethod === 'GATEWAY_PAYPAL'
                        ? 'PayPal Instant'
                        : 'Visa / Mastercard (Stripe)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-500 block text-[11px]">Reference / Transaction ID</span>
                    <span className="font-mono font-bold text-neutral-900 break-all">
                      {payment.submittedTransactionId || payment.gatewayReference || payment.id}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-500 block text-[11px]">Verification Timestamp</span>
                    <span className="font-semibold text-neutral-900">
                      {payment.verificationDate
                        ? new Date(payment.verificationDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Awaiting clearance'}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-500 block text-[11px]">Internal Auditor Notes</span>
                    <span className="text-neutral-800 italic">
                      {payment.adminNotes || 'Standard transaction check.'}
                    </span>
                  </div>
                </div>

                {/* Rejection Reason Notice */}
                {payment.status === 'rejected' && payment.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Administrator Rejection Reason:</strong>
                      <span>{payment.rejectionReason}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {/* Check Status Button */}
                    <button
                      type="button"
                      onClick={() => handleCheckStatus(payment)}
                      disabled={checkingId === payment.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${checkingId === payment.id ? 'animate-spin' : ''}`} />
                      <span>{checkingId === payment.id ? 'Checking...' : 'Check Status'}</span>
                    </button>

                    {/* Resubmit Transaction ID Button if Rejected */}
                    {payment.status === 'rejected' && (
                      <button
                        type="button"
                        onClick={() => {
                          setResubmitTarget(payment);
                          setNewTxId('');
                          setResubmitError(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Submit New Transaction ID</span>
                      </button>
                    )}

                    {/* Retry Gateway Button if Failed or Canceled */}
                    {(payment.status === 'failed' || payment.status === 'expired') && (
                      <button
                        type="button"
                        onClick={() => openPropertyDetail(payment.propertyId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Gateway Payment</span>
                      </button>
                    )}
                  </div>

                  {/* View Property Details Link */}
                  <button
                    type="button"
                    onClick={() => openPropertyDetail(payment.propertyId)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                  >
                    <span>{payment.status === 'verified' ? 'View Unlocked Property Map' : 'Go to Property Listing'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resubmit Transaction ID Dialog Modal */}
        {resubmitTarget && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h4 className="text-base font-bold text-neutral-900 font-serif-display">
                  Submit New Transaction ID
                </h4>
                <button
                  onClick={() => setResubmitTarget(null)}
                  className="text-neutral-400 hover:text-neutral-700 p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-neutral-600">
                Your previous submission for <strong className="text-neutral-900">{resubmitTarget.propertyTitle}</strong> was rejected. Please enter the correct transaction reference from your payment receipt or SMS.
              </p>

              {resubmitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {resubmitError}
                </div>
              )}

              <form onSubmit={handleResubmitTx} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    New Transaction Reference ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newTxId}
                    onChange={(e) => setNewTxId(e.target.value)}
                    placeholder="e.g. TX-994210-NEW"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResubmitTarget(null)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNewTx}
                    className="px-4 py-2 text-xs font-bold bg-slate-950 hover:bg-slate-900 text-white rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingNewTx ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
