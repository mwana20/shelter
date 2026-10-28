import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Heart,
  TrendingUp,
  Clock,
  Home,
  Tag,
  Plus,
  Edit2,
  BarChart3,
  Calendar,
  MessageSquare,
  Lock,
  Unlock,
  CreditCard,
  Building2,
  Settings,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUGX, formatCompactUGX } from '../utils/format';
import { PropertyStatus, LocationUnlockPayment, LocationLockSettings } from '../types';
import { backendApi } from '../services/backendApi';

export const AdminDashboardPage: React.FC = () => {
  const {
    properties,
    approveProperty,
    rejectProperty,
    deleteProperty,
    updatePropertyStatus,
    toggleVerifiedStatus,
    viewingRequests,
    updateViewingStatus,
    enquiries,
    setCurrentPage,
    openPropertyDetail,
    isAdmin,
    locationLockSettings,
    updateLocationLockSettings,
    showNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'inventory' | 'moderation' | 'locking' | 'payments' | 'viewings' | 'analytics'
  >('locking');

  // Payments Ledger State
  const [payments, setPayments] = useState<LocationUnlockPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Rejection Dialog State
  const [rejectingPayment, setRejectingPayment] = useState<LocationUnlockPayment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Manual Unlock Dialog State
  const [manualUnlockModalOpen, setManualUnlockModalOpen] = useState(false);
  const [manualPropertyId, setManualPropertyId] = useState('');
  const [manualUserEmail, setManualUserEmail] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [isManualUnlocking, setIsManualUnlocking] = useState(false);

  // Local editable settings form
  const [localSettings, setLocalSettings] = useState<LocationLockSettings>(locationLockSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    setLocalSettings(locationLockSettings);
  }, [locationLockSettings]);

  // Load Admin Payments
  const fetchAdminPayments = async () => {
    if (!isAdmin) return;
    setPaymentsLoading(true);
    const res = await backendApi.getAdminPayments(isAdmin, statusFilter);
    setPaymentsLoading(false);
    if (res.success && res.payments) {
      setPayments(res.payments);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminPayments();
    }
  }, [isAdmin, statusFilter]);

  // Stats calculation
  const totalProperties = properties.length;
  const propertiesForSale = properties.filter((p) => p.listingType === 'Sale').length;
  const propertiesForRent = properties.filter((p) => p.listingType === 'Rent').length;
  const availableCount = properties.filter((p) => p.status === 'Available').length;
  const pendingCount = properties.filter((p) => p.status === 'Pending').length;
  const pendingListings = properties.filter((p) => p.status === 'Pending');

  // Security Check: Only Admins can access
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-140px)] py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-neutral-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif-display text-neutral-900">
            Administrator Access Required
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Location locking configuration, merchant payment credentials, and transaction verification queues are strictly restricted to authenticated administrators.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setCurrentPage('sign-in')}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign in as an administrator</span>
            </button>
            <button
              onClick={() => setCurrentPage('home')}
              className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    await updateLocationLockSettings(localSettings);
    setIsSavingSettings(false);
  };

  // Toggle Property Specific Lock
  const handleTogglePropertyLock = async (propertyId: string) => {
    const isCurrentlyLocked = localSettings.lockedPropertyIds.includes(propertyId);
    const newLocked = isCurrentlyLocked
      ? localSettings.lockedPropertyIds.filter((id) => id !== propertyId)
      : [...localSettings.lockedPropertyIds, propertyId];

    const updated = { ...localSettings, lockedPropertyIds: newLocked };
    setLocalSettings(updated);
    await updateLocationLockSettings({ lockedPropertyIds: newLocked });
  };

  // Handle Approve Merchant Transaction
  const handleApprovePayment = async (paymentId: string) => {
    const res = await backendApi.reviewPayment(isAdmin, paymentId, 'approve');
    if (res.success) {
      showNotification('Payment approved! Location unlocked for user.', 'success');
      fetchAdminPayments();
    } else {
      showNotification(res.error || 'Failed to approve payment', 'error');
    }
  };

  // Handle Reject Merchant Transaction (with mandatory reason)
  const handleConfirmReject = async () => {
    if (!rejectingPayment) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      showNotification('A mandatory rejection reason is required (minimum 5 characters).', 'error');
      return;
    }

    setIsRejecting(true);
    const res = await backendApi.reviewPayment(isAdmin, rejectingPayment.id, 'reject', rejectionReason.trim());
    setIsRejecting(false);

    if (res.success) {
      showNotification('Payment rejected and reason logged.', 'info');
      setRejectingPayment(null);
      setRejectionReason('');
      fetchAdminPayments();
    } else {
      showNotification(res.error || 'Failed to reject payment', 'error');
    }
  };

  // Handle Manual Support Unlock (with mandatory audit reason)
  const handleConfirmManualUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPropertyId || !manualUserEmail || !manualReason.trim() || manualReason.trim().length < 8) {
      showNotification('All fields and a valid audit reason (minimum 8 characters) are mandatory.', 'error');
      return;
    }

    setIsManualUnlocking(true);
    const res = await backendApi.manualUnlockLocation(isAdmin, {
      propertyId: manualPropertyId,
      userId: `usr_manual_${Date.now()}`,
      userEmail: manualUserEmail.trim(),
      userName: manualUserEmail.split('@')[0],
      reason: manualReason.trim()
    });
    setIsManualUnlocking(false);

    if (res.success) {
      showNotification('Location successfully unlocked via manual override. Audit record logged.', 'success');
      setManualUnlockModalOpen(false);
      setManualPropertyId('');
      setManualUserEmail('');
      setManualReason('');
      fetchAdminPayments();
    } else {
      showNotification(res.error || 'Failed to unlock location', 'error');
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>Sheltered Global Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">
              Admin Governance &amp; Payment Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Control location locking policies, configure payment gateways &amp; merchant codes, and audit user payment clearances.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="bg-white/10 text-white text-xs font-semibold py-2.5 px-4 rounded-xl border border-white/20 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Administrator verified</span>
            </span>
            <button
              onClick={() => setCurrentPage('list-property')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Listing</span>
            </button>
          </div>
        </div>

        {/* Top Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Total Listings</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{totalProperties}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Location Locking</p>
            <p className="text-sm font-bold text-neutral-900 mt-2 flex items-center gap-1">
              {locationLockSettings.enabledGlobally ? (
                <span className="text-amber-600 flex items-center gap-1"><Lock className="w-4 h-4" /> Global Active</span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1"><Unlock className="w-4 h-4" /> Disabled by Default</span>
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Locked Listings</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {locationLockSettings.enabledGlobally
                ? totalProperties
                : locationLockSettings.lockedPropertyIds.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Unlock Fee</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">
              {locationLockSettings.unlockFeeCurrency} {locationLockSettings.unlockFeeAmount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Unlock Payments</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{payments.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Pending Moderation</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Gateway & Backend Environment Mode Banner */}
        <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-emerald-900/10 border border-blue-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-neutral-950">
                Operating in Standalone Sandbox / Mock Ledger Mode
              </p>
              <p className="text-neutral-600 mt-0.5">
                No external payment gateway keys or live API base URL are needed right now. All registrations, 18+ verification, password resets, location locking, dual-option payments, and admin approvals function completely out-of-the-box. When you are ready to connect your live services, simply supply the keys in your environment.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 font-mono text-[11px] text-blue-900 font-semibold">
              Gateway: Sandbox
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 font-mono text-[11px] text-emerald-900 font-semibold">
              API Base: Local Service
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 overflow-x-auto gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('locking')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'locking'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Location Locking &amp; Payment Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Unlock Payments &amp; Verification Queue ({payments.filter((p) => p.status === 'pending').length} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Property Inventory ({totalProperties})</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Listing Approvals ({pendingListings.length})</span>
          </button>
        </div>

        {/* TAB 1: LOCATION LOCKING & PAYMENT CONFIGURATION */}
        {activeTab === 'locking' && (
          <div className="space-y-8">
            <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 font-serif-display flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <span>Location Privacy &amp; Paid Unlocking Rules</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Configure global locking activation, unlock fees, gateway options, and merchant-code verification settings.
                </p>
              </div>

              {/* Notice: Disabled by Default */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-950 font-bold">Default System Configuration:</strong>
                  <span>Location locking is DISABLED by default. It only activates when an admin toggles it globally below, or designates specific properties or areas.</span>
                </div>
              </div>

              {/* Main Switches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Global Toggle */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-neutral-900 block">Global Location Locking</span>
                      <span className="text-xs text-neutral-500">Lock exact coordinates on all platform properties</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.enabledGlobally}
                        onChange={(e) => setLocalSettings({ ...localSettings, enabledGlobally: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Status: <strong className={localSettings.enabledGlobally ? 'text-amber-700' : 'text-neutral-700'}>
                      {localSettings.enabledGlobally ? 'ACTIVE (All properties locked)' : 'DISABLED (Free map visibility active)'}
                    </strong>
                  </p>
                </div>

                {/* Unlock Fee & Currency */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
                  <span className="text-sm font-bold text-neutral-900 block">Unlock Fee Amount &amp; Currency</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Fee Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={localSettings.unlockFeeAmount}
                        onChange={(e) => setLocalSettings({ ...localSettings, unlockFeeAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-bold text-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Currency</label>
                      <select
                        value={localSettings.unlockFeeCurrency}
                        onChange={(e) => setLocalSettings({ ...localSettings, unlockFeeCurrency: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-bold text-neutral-900 cursor-pointer"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="UGX">UGX (USh)</option>
                        <option value="KES">KES (KSh)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Gateway Option Toggle */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-neutral-900 block">Online Payment Gateway</span>
                      <span className="text-xs text-neutral-500">Visa, Mastercard, and PayPal integration</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.gatewayEnabled}
                        onChange={(e) => setLocalSettings({ ...localSettings, gatewayEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Supports Stripe hosted elements &amp; webhooks without custom card number collection.
                  </p>
                </div>

                {/* Merchant Code Option Toggle */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-neutral-900 block">Merchant Code Payment</span>
                      <span className="text-xs text-neutral-500">Manual mobile money / bank transfer with Tx ID</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.merchantCodeEnabled}
                        onChange={(e) => setLocalSettings({ ...localSettings, merchantCodeEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Enables users to pay offline and submit confirmation reference IDs.
                  </p>
                </div>
              </div>

              {/* Merchant Configuration Section */}
              {localSettings.merchantCodeEnabled && (
                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Merchant Details &amp; Transaction ID Validation Rules
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Merchant Code (Displayed to Users)
                      </label>
                      <input
                        type="text"
                        value={localSettings.merchantCode}
                        onChange={(e) => setLocalSettings({ ...localSettings, merchantCode: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Merchant / Entity Legal Name
                      </label>
                      <input
                        type="text"
                        value={localSettings.merchantName}
                        onChange={(e) => setLocalSettings({ ...localSettings, merchantName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Payment Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={localSettings.paymentInstructions}
                      onChange={(e) => setLocalSettings({ ...localSettings, paymentInstructions: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
                    />
                  </div>

                  {/* Transaction ID Rules */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Min Length</label>
                      <input
                        type="number"
                        value={localSettings.txIdRules.minLength}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            txIdRules: { ...localSettings.txIdRules, minLength: Number(e.target.value) }
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Max Length</label>
                      <input
                        type="number"
                        value={localSettings.txIdRules.maxLength}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            txIdRules: { ...localSettings.txIdRules, maxLength: Number(e.target.value) }
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Verification Mode</label>
                      <select
                        value={localSettings.verificationMode}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            verificationMode: e.target.value as 'automatic' | 'manual'
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <option value="automatic">Automatic API Validation</option>
                        <option value="manual">Manual Admin Review Queue</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="py-3 px-6 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingSettings ? 'Saving Configuration...' : 'Save All Payment & Lock Settings'}
                </button>
              </div>
            </form>

            {/* Per-Listing Location Lock Overrides */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 font-serif-display">
                    Individual Property Lock Overrides
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Lock specific high-value properties even when global locking is off, or unlock selected properties.
                  </p>
                </div>
                <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-xl">
                  {localSettings.lockedPropertyIds.length} properties locked individually
                </span>
              </div>

              <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
                {properties.map((prop) => {
                  const isLockedIndividually = localSettings.lockedPropertyIds.includes(prop.id);
                  const isGloballyLocked = localSettings.enabledGlobally;
                  const isEffectiveLocked = isGloballyLocked || isLockedIndividually;

                  return (
                    <div key={prop.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 truncate">
                        <img
                          src={prop.images[0]}
                          alt=""
                          className="w-12 h-10 object-cover rounded-lg shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-neutral-900 truncate">{prop.title}</p>
                          <p className="text-[11px] text-neutral-500">
                            {prop.district}, {prop.country} · {prop.currency} {prop.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isEffectiveLocked
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isEffectiveLocked ? 'Locked' : 'Open'}
                        </span>

                        <button
                          type="button"
                          disabled={isGloballyLocked}
                          onClick={() => handleTogglePropertyLock(prop.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isGloballyLocked
                              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                              : isLockedIndividually
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {isGloballyLocked
                            ? 'Global Lock Active'
                            : isLockedIndividually
                            ? 'Unlock Property'
                            : 'Lock Location'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UNLOCK PAYMENTS & VERIFICATION QUEUE */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 font-serif-display flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Location Unlock Payments Ledger</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Review gateway settlements, approve/reject merchant code transaction IDs, and execute manual support overrides.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setManualUnlockModalOpen(true)}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Manual Support Unlock</span>
                </button>

                <button
                  onClick={fetchAdminPayments}
                  className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 cursor-pointer"
                  title="Refresh Payments"
                >
                  <RefreshCw className={`w-4 h-4 ${paymentsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {['ALL', 'pending', 'verified', 'rejected', 'duplicate'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer capitalize ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Submissions' : st}
                </button>
              ))}
            </div>

            {/* Payments Table */}
            {paymentsLoading ? (
              <div className="py-12 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading payment ledger...</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                No payment submissions matching filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] font-bold border-y border-neutral-100">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Tx ID / Gateway Ref</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-neutral-50/60 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-neutral-900">{payment.userName}</p>
                          <p className="text-[11px] text-neutral-500">{payment.userEmail}</p>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-neutral-900 max-w-[180px] truncate">
                          {payment.propertyTitle}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-neutral-700">
                            {payment.paymentMethod === 'MERCHANT_CODE'
                              ? 'Merchant Code'
                              : payment.paymentMethod === 'GATEWAY_PAYPAL'
                              ? 'PayPal'
                              : 'Visa / Mastercard'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-800">
                          {payment.submittedTransactionId || payment.gatewayReference || payment.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              payment.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : payment.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : payment.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-neutral-500">
                          {new Date(payment.submissionDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {payment.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApprovePayment(payment.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingPayment(payment);
                                  setRejectionReason('');
                                }}
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXISTING INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
              Live Property Inventory ({properties.length})
            </h3>
            <div className="divide-y divide-neutral-100">
              {properties.map((p) => (
                <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="w-16 h-12 object-cover rounded-xl" />
                    <div>
                      <p className="font-bold text-xs text-neutral-900">{p.title}</p>
                      <p className="text-[11px] text-neutral-500">
                        {p.district}, {p.country} · {p.currency} {p.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openPropertyDetail(p.id)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    View Listing
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MODERATION */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
              Listing Moderation Queue ({pendingListings.length})
            </h3>
            {pendingListings.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">No properties awaiting approval.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {pendingListings.map((p) => (
                  <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                    <p className="font-bold text-xs text-neutral-900">{p.title}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveProperty(p.id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectProperty(p.id, 'Moderation review check.')}
                        className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REJECTION DIALOG (Mandatory Reason Required) */}
        {rejectingPayment && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Reject Payment Submission</span>
              </div>
              <p className="text-xs text-neutral-600">
                You are rejecting transaction <strong className="text-neutral-900 font-mono">{rejectingPayment.submittedTransactionId}</strong> for user <strong className="text-neutral-900">{rejectingPayment.userName}</strong>.
              </p>
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Mandatory Rejection Reason:
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Transaction ID was not found on the bank statement, or payment amount does not match unlock fee."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRejecting || rejectionReason.trim().length < 5}
                  onClick={handleConfirmReject}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MANUAL SUPPORT UNLOCK DIALOG (Mandatory Audit Reason) */}
        {manualUnlockModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleConfirmManualUnlock} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Unlock className="w-5 h-5" />
                <span>Manual Location Unlock (Support Override)</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Manually grant permanent location clearance to a user in exceptional support cases. An audit record will be logged with your administrator identity.
              </p>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Target Property:
                </label>
                <select
                  required
                  value={manualPropertyId}
                  onChange={(e) => setManualPropertyId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs bg-white"
                >
                  <option value="">Select Property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Recipient User Email:
                </label>
                <input
                  type="email"
                  required
                  value={manualUserEmail}
                  onChange={(e) => setManualUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Mandatory Audit Reason (min 8 chars):
                </label>
                <textarea
                  required
                  rows={2}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g. VIP client payment verified in-person at Mbale HQ cash office."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualUnlockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isManualUnlocking}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isManualUnlocking ? 'Unlocking...' : 'Execute Manual Unlock'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
