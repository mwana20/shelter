import React, { useState } from 'react';
import {
  X,
  Lock,
  CreditCard,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Property } from '../types';
import { backendApi, API_RUNTIME_CONFIG } from '../services/backendApi';
import visaLogo from '../assets/images/visa.png';
import mastercardLogo from '../assets/images/mastercard.png';
const mobileMoneyLogo = new URL('../assets/images/airmtn.PNG', import.meta.url).href;

interface LocationUnlockModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export const LocationUnlockModal: React.FC<LocationUnlockModalProps> = ({
  property,
  isOpen,
  onClose,
  onUnlocked
}) => {
  const {
    currentUser,
    locationLockSettings,
    refreshLocationData,
    showNotification
  } = useApp();

  const [paymentOption, setPaymentOption] = useState<'gateway' | 'merchant'>('gateway');

  // Option A (Gateway) States
  const [gatewaySubMethod, setGatewaySubMethod] = useState<'card' | 'paypal'>('card');
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewayConfirmed, setGatewayConfirmed] = useState(false);
  const [gatewayReceipt, setGatewayReceipt] = useState<{
    reference: string;
    amount: number;
    currency: string;
    date: string;
    method: string;
  } | null>(null);

  // Option B (Merchant Code) States
  const [transactionId, setTransactionId] = useState('');
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [merchantPendingReview, setMerchantPendingReview] = useState(false);
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  if (!isOpen || !property) return null;

  const feeAmount = locationLockSettings.unlockFeeAmount;
  const feeCurrency = locationLockSettings.unlockFeeCurrency;

  // Handle Copy Merchant Code
  const handleCopyMerchantCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(locationLockSettings.merchantCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      showNotification('Merchant code copied to clipboard.', 'success');
    }
  };

  // Process Gateway Payment (Hosted Elements Simulation - No raw card numbers in custom forms)
  const handleGatewayCheckout = async () => {
    setGatewayLoading(true);
    setTxError(null);

    // 1. Create session via backend
    const sessionRes = await backendApi.createGatewaySession({
      propertyId: property.id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      paymentMethod: gatewaySubMethod === 'paypal' ? 'PAYPAL' : 'VISA'
    });

    if (!sessionRes.success || !sessionRes.sessionId) {
      setGatewayLoading(false);
      setTxError(sessionRes.error || 'Failed to initialize secure gateway session.');
      return;
    }

    // 2. Simulate hosted gateway processing and webhook confirmation
    setTimeout(async () => {
      const verifyRes = await backendApi.verifyGatewayPayment({
        sessionId: sessionRes.sessionId!,
        propertyId: property.id,
        userId: currentUser.id
      });

      setGatewayLoading(false);

      if (verifyRes.success) {
        setGatewayConfirmed(true);
        setGatewayReceipt({
          reference: sessionRes.sessionId!,
          amount: feeAmount,
          currency: feeCurrency,
          date: new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          method: gatewaySubMethod === 'paypal' ? 'PayPal Instant Settlement' : 'Visa / Mastercard (Stripe Checkout)'
        });
        await refreshLocationData(property.id);
        showNotification('Payment verified! Exact location is now permanently unlocked.', 'success');
        onUnlocked();
      } else {
        setTxError(verifyRes.error || 'Payment gateway failed or was canceled.');
      }
    }, 1200);
  };

  // Submit Merchant Transaction ID
  const handleMerchantTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxError(null);

    const cleanTx = transactionId.trim();
    if (!cleanTx) {
      setTxError('Please enter the transaction reference ID from your receipt or SMS.');
      return;
    }

    setTxSubmitting(true);

    const res = await backendApi.submitMerchantTransaction({
      propertyId: property.id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      transactionId: cleanTx
    });

    setTxSubmitting(false);

    if (res.success) {
      if (res.status === 'verified') {
        await refreshLocationData(property.id);
        showNotification('Transaction verified! Exact location unlocked.', 'success');
        onUnlocked();
        onClose();
      } else if (res.status === 'pending') {
        setMerchantPendingReview(true);
        if (res.payment?.id) {
          setPendingSubmissionId(res.payment.id);
        }
      }
    } else {
      if (res.status === 'duplicate') {
        setTxError('Transaction ID already used. You have already submitted this reference.');
      } else {
        setTxError(res.error || 'Verification failed. Please check the transaction ID and try again.');
      }
    }
  };

  // Re-check Pending Status
  const handleCheckPendingStatus = async () => {
    if (!pendingSubmissionId) return;
    setCheckingStatus(true);
    const res = await backendApi.getPaymentStatus(pendingSubmissionId);
    setCheckingStatus(false);

    if (res.payment?.status === 'verified') {
      await refreshLocationData(property.id);
      showNotification('Payment verified by administrator! Location is now unlocked.', 'success');
      onUnlocked();
      onClose();
    } else if (res.payment?.status === 'rejected') {
      setMerchantPendingReview(false);
      setTxError(`Payment rejected: ${res.payment.rejectionReason || 'Transaction ID could not be confirmed.'}`);
    } else {
      showNotification('Transaction is still pending administrator review.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="relative shrink-0 bg-slate-950 p-4 pb-4 text-white sm:p-6 sm:pb-5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Lock className="w-4 h-4" />
            <span>Pay to Unlock Exact Location</span>
          </div>
          <h3 className="text-xl font-bold font-serif-display text-white pr-8">
            {property.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            General Area: <span className="font-semibold text-white">{property.district}, {property.country}</span>
          </p>

          <div className="mt-4 flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-white/15">
            <div>
              <span className="text-[11px] text-slate-300 block">Unlock Fee</span>
              <span className="text-lg font-extrabold text-white">
                {feeCurrency} {feeAmount.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-lg font-semibold">
              Permanent Access
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {gatewayConfirmed && gatewayReceipt ? (
            /* Gateway Confirmation Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-bold text-neutral-900 font-serif-display">
                Location Unlocked Successfully!
              </h4>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Your payment was verified via the secure gateway. Exact GPS coordinates, title boundary markers, and directions are now live.
              </p>

              {/* Receipt Summary Card */}
              <div className="bg-neutral-50 rounded-2xl p-4 text-xs text-neutral-700 border border-neutral-200 text-left space-y-2">
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Property Title</span>
                  <span className="font-semibold text-neutral-900 truncate max-w-[200px]">{property.title}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Payment Reference</span>
                  <span className="font-mono text-neutral-900">{gatewayReceipt.reference}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Payment Method</span>
                  <span className="font-semibold text-neutral-900">{gatewayReceipt.method}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Amount Paid</span>
                  <span className="font-bold text-emerald-700">{gatewayReceipt.currency} {gatewayReceipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Date</span>
                  <span className="text-neutral-800">{gatewayReceipt.date}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-md"
              >
                View Full Location &amp; Interactive Map
              </button>
            </div>
          ) : merchantPendingReview ? (
            /* Merchant Pending Review Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 font-serif-display">
                Transaction Submitted for Review
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
                Your payment is being verified against our merchant ledger. You will get access once verification is complete.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left">
                <span className="font-semibold block text-[11px] uppercase tracking-wide text-amber-800 mb-1">
                  Submitted Reference:
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900">{transactionId}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCheckPendingStatus}
                  disabled={checkingStatus}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
                  <span>{checkingStatus ? 'Checking Status...' : 'Check Verification Status'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Payment Method Choice & Form */
            <>
              {txError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{txError}</span>
                </div>
              )}

              {/* Two Payment Options Tab Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentOption('gateway');
                    setTxError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    paymentOption === 'gateway'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Pay with Card / PayPal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentOption('merchant');
                    setTxError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    paymentOption === 'merchant'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Pay with Merchant Code</span>
                </button>
              </div>

              {/* OPTION A: Online Payment Gateway */}
              {paymentOption === 'gateway' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGatewaySubMethod('card')}
                      className={`flex-1 p-3 border rounded-xl text-left transition cursor-pointer ${
                        gatewaySubMethod === 'card'
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-neutral-900">Visa / Mastercard</span>
                        <div className="flex items-center gap-2">
                          <img src={visaLogo} alt="Visa" className="h-6 w-10 object-contain" />
                          <img src={mastercardLogo} alt="Mastercard" className="h-6 w-10 object-contain" />
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGatewaySubMethod('paypal')}
                      className={`flex-1 p-3 border rounded-xl text-left transition cursor-pointer ${
                        gatewaySubMethod === 'paypal'
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-neutral-900">PayPal Express</span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-indigo-700 text-[10px] font-extrabold text-white rounded">PayPal</span>
                    </button>
                  </div>

                  {/* Hosted Embedded Checkout Frame Simulation (Security rule: Never collect raw card numbers in custom forms) */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-800">Secure Hosted Element</span>
                      <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> 256-bit TLS Encrypted
                      </span>
                    </div>

                    {!API_RUNTIME_CONFIG.isLiveGatewayConfigured && (
                      <div className="px-3 py-2 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                        <span className="text-[11px] font-medium">
                          <strong>Sandbox Simulator:</strong> Ready for live gateway keys
                        </span>
                        <span className="text-[10px] font-semibold uppercase bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">
                          Demo / Test
                        </span>
                      </div>
                    )}

                    <div className="p-3 bg-white border border-neutral-300 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">Payer Name:</span>
                        <span className="font-semibold text-neutral-900">{currentUser.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">Payer Email:</span>
                        <span className="font-semibold text-neutral-900">{currentUser.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t border-neutral-100 pt-1.5">
                        <span className="text-neutral-500">Gateway Provider:</span>
                        <span className="font-mono text-[11px] text-neutral-700">Stripe Hosted Elements &amp; Webhooks</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGatewayCheckout}
                    disabled={gatewayLoading}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {gatewayLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying with payment gateway...</span>
                      </span>
                    ) : (
                      <>
                        <span>Pay {feeCurrency} {feeAmount.toLocaleString()} via Gateway</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* OPTION B: Merchant Code & Transaction ID */}
              {paymentOption === 'merchant' && (
                <form onSubmit={handleMerchantTxSubmit} className="space-y-4">
                  {/* Merchant Details Box */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800">Merchant Code:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {locationLockSettings.merchantCode}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyMerchantCode}
                          className="p-1.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition cursor-pointer"
                          title="Copy Merchant Code"
                        >
                          {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-600 space-y-1 border-t border-neutral-200 pt-2">
                      <p><strong className="text-neutral-800">Merchant Name:</strong> {locationLockSettings.merchantName}</p>
                      <p><strong className="text-neutral-800">Instructions:</strong> {locationLockSettings.paymentInstructions}</p>
                    </div>

                    {locationLockSettings.supportedChannels.length > 0 && (
                      <div className="pt-2 border-t border-neutral-200">
                        <span className="text-[11px] font-semibold text-neutral-700 block mb-1">
                          Supported Payment Channels:
                        </span>
                        <ul className="text-[11px] text-neutral-600 space-y-0.5 list-disc list-inside">
                          {locationLockSettings.supportedChannels.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                            <li className="list-none pt-1">
                              <span className="sr-only">MTN Mobile Money and Airtel Money</span>
                              <span className="inline-flex h-12 w-48 items-center justify-center rounded-md bg-neutral-950 px-2">
                                <img
                                  src={mobileMoneyLogo}
                                  alt="MTN Mobile Money and Airtel Money"
                                  className="h-10 w-full object-contain"
                                />
                              </span>
                            </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Transaction ID Input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Transaction Reference ID <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. TX-882194-MBL or GW-20261027-01"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Pay the exact amount using the merchant code above, then copy the transaction ID from your payment confirmation SMS, app receipt, or bank statement and submit it here.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={txSubmitting}
                    className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {txSubmitting ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying transaction ID...</span>
                      </span>
                    ) : (
                      <>
                        <span>Submit Transaction ID for Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
