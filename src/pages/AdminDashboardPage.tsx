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
import {
  AdminPropertyReview,
  AdminSubscription,
  AdminSubscriptionConfig,
  AdminSubscriptionUser,
  subscriptionAdminApi
} from '../services/subscriptionAdminApi';

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
    'inventory' | 'moderation' | 'locking' | 'payments' | 'viewings' | 'analytics' | 'subscriptions'
  >('moderation');

  useEffect(() => {
    const handleDashboardSection = (event: Event) => {
      setActiveTab((event as CustomEvent<typeof activeTab>).detail);
    };

    window.addEventListener('sheltered-dashboard-section', handleDashboardSection);
    return () => window.removeEventListener('sheltered-dashboard-section', handleDashboardSection);
  }, []);

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
  const [propertyReviewQueue, setPropertyReviewQueue] = useState<AdminPropertyReview[]>([]);
  const [propertyReviewFilter, setPropertyReviewFilter] = useState('PENDING_REVIEW');
  const [propertyReviewLoading, setPropertyReviewLoading] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [propertyReviewError, setPropertyReviewError] = useState('');
  const [propertyReviewNotes, setPropertyReviewNotes] = useState<Record<string, string>>({});
  const [subscriptionConfig, setSubscriptionConfig] = useState<AdminSubscriptionConfig | null>(null);
  const [subscriptionRows, setSubscriptionRows] = useState<AdminSubscription[]>([]);
  const [subscriptionUsers, setSubscriptionUsers] = useState<AdminSubscriptionUser[]>([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState('ALL');
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionSaving, setSubscriptionSaving] = useState(false);
  const [grantUserId, setGrantUserId] = useState('');
  const [grantPlan, setGrantPlan] = useState<'FREE' | 'PAID'>('FREE');
  const [grantDuration, setGrantDuration] = useState(1);
  const [grantReason, setGrantReason] = useState('');
  const [revocationTarget, setRevocationTarget] = useState<AdminSubscription | null>(null);
  const [revocationReason, setRevocationReason] = useState('');

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

  const fetchPropertyReviewQueue = async () => {
    if (!isAdmin) return;
    setPropertyReviewLoading(true);
    setPropertyReviewError('');
    try {
      const [queue, pending] = await Promise.all([
        subscriptionAdminApi.listProperties(propertyReviewFilter),
        propertyReviewFilter === 'PENDING_REVIEW'
          ? Promise.resolve(null)
          : subscriptionAdminApi.listProperties('PENDING_REVIEW')
      ]);
      setPropertyReviewQueue(queue.items);
      setPendingReviewCount(pending?.totalItems ?? queue.totalItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load property review queue.';
      setPropertyReviewError(message);
      showNotification(message, 'error');
    } finally {
      setPropertyReviewLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'moderation') void fetchPropertyReviewQueue();
  }, [activeTab, isAdmin, propertyReviewFilter]);

  const fetchSubscriptionManagement = async () => {
    if (!isAdmin) return;
    setSubscriptionLoading(true);
    try {
      const [config, rows, users] = await Promise.all([
        subscriptionAdminApi.getConfig(),
        subscriptionAdminApi.listSubscriptions(subscriptionFilter),
        subscriptionAdminApi.listUsers()
      ]);
      setSubscriptionConfig(config);
      setSubscriptionRows(rows);
      setSubscriptionUsers(users);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to load subscription management.', 'error');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'subscriptions') void fetchSubscriptionManagement();
  }, [activeTab, isAdmin, subscriptionFilter]);

  const handleSaveSubscriptionConfig = async () => {
    if (!subscriptionConfig) return;
    setSubscriptionSaving(true);
    try {
      const saved = await subscriptionAdminApi.updateConfig({
        baseMonthlyPrice: Number(subscriptionConfig.baseMonthlyPrice),
        currency: subscriptionConfig.currency.toUpperCase(),
        freeValidityDays: Number(subscriptionConfig.freeValidityDays),
        freeListingLimit: Number(subscriptionConfig.freeListingLimit),
        freeMapUnlockLimit: Number(subscriptionConfig.freeMapUnlockLimit),
        paidListingLimit: Number(subscriptionConfig.paidListingLimit),
        paidMapUnlockLimit: Number(subscriptionConfig.paidMapUnlockLimit),
        discounts: subscriptionConfig.discounts.map(({ minMonths, maxMonths, discountPercent }) => ({
          minMonths: Number(minMonths),
          maxMonths: Number(maxMonths),
          discountPercent: Number(discountPercent)
        }))
      });
      setSubscriptionConfig(saved);
      showNotification('Subscription pricing and privileges saved.', 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to save subscription settings.', 'error');
    } finally {
      setSubscriptionSaving(false);
    }
  };

  const handleGrantSubscription = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await subscriptionAdminApi.grant(grantUserId.trim(), {
        plan: grantPlan,
        ...(grantPlan === 'PAID' ? { durationMonths: grantDuration } : {}),
        reason: grantReason.trim()
      });
      setGrantUserId('');
      setGrantReason('');
      showNotification('Subscription granted and recorded in the audit log.', 'success');
      await fetchSubscriptionManagement();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to grant subscription.', 'error');
    }
  };

  const handleRevokeSubscription = async () => {
    if (!revocationTarget) return;
    try {
      await subscriptionAdminApi.revoke(revocationTarget.id, revocationReason.trim());
      setRevocationTarget(null);
      setRevocationReason('');
      showNotification('Subscription revoked and recorded in the audit log.', 'success');
      await fetchSubscriptionManagement();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to revoke subscription.', 'error');
    }
  };

  const handlePropertyReview = async (
    property: AdminPropertyReview,
    action: 'approve' | 'reject' | 'corrections'
  ) => {
    const notes = propertyReviewNotes[property.id]?.trim();
    if (action !== 'approve' && !notes) {
      showNotification('Add review notes before rejecting or requesting corrections.', 'error');
      return;
    }
    try {
      await subscriptionAdminApi.reviewProperty(property.id, action, notes);
      setPropertyReviewNotes((current) => ({ ...current, [property.id]: '' }));
      showNotification(
        action === 'approve' ? 'Property approved and published.' : action === 'reject' ? 'Property rejected.' : 'Corrections requested.',
        'success'
      );
      await fetchPropertyReviewQueue();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Property review failed.', 'error');
    }
  };

  // Stats calculation
  const totalProperties = properties.length;
  const propertiesForSale = properties.filter((p) => p.listingType === 'Sale').length;
  const propertiesForRent = properties.filter((p) => p.listingType === 'Rent').length;
  const availableCount = properties.filter((p) => p.status === 'Available').length;
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
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{pendingReviewCount}</p>
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
                Connected to Shelter administration
              </p>
              <p className="text-neutral-600 mt-0.5">
                Review submitted listings and manage subscriptions using the connected backend. Listing approvals are loaded from the server and are independent of the demo property inventory.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => setActiveTab('moderation')} className="rounded-lg bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-900">
            {pendingReviewCount} listing{pendingReviewCount === 1 ? '' : 's'} awaiting review
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-neutral-200 text-xs font-bold">
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
            <span>Listing Approvals ({pendingReviewCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscriptions &amp; Pricing</span>
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
                          src={prop.imageThumbnails?.[0] || prop.images[0]}
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
                    <img src={p.imageThumbnails?.[0] || p.images[0]} alt="" width={320} height={240} loading="lazy" decoding="async" className="w-16 h-12 object-cover rounded-xl" />
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
                  Property review queue ({propertyReviewQueue.length})
                </h3>
                <p className="mt-1 text-xs text-neutral-500">Review ownership, location, media, and approval history before publishing.</p>
              </div>
              {propertyReviewError && (
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  Could not load listings from the backend: {propertyReviewError}
                </div>
              )}
              <div className="flex items-center gap-2">
                <select
                  value={propertyReviewFilter}
                  onChange={(event) => setPropertyReviewFilter(event.target.value)}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-xs"
                  aria-label="Filter property review status"
                >
                  {['PENDING_REVIEW', 'CORRECTION_REQUESTED', 'REJECTED', 'ACTIVE', 'ALL'].map((status) => (
                    <option key={status} value={status}>{status === 'ALL' ? 'All statuses' : status.replaceAll('_', ' ')}</option>
                  ))}
                </select>
                <button type="button" onClick={() => void fetchPropertyReviewQueue()} className="rounded-lg border border-neutral-300 p-2 text-neutral-700" aria-label="Refresh property review queue">
                  <RefreshCw className={`h-4 w-4 ${propertyReviewLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            {propertyReviewLoading ? (
              <p className="py-8 text-center text-sm text-neutral-500">Loading submitted properties...</p>
            ) : propertyReviewQueue.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">No properties awaiting approval.</p>
            ) : (
              <div className="grid gap-5">
                {propertyReviewQueue.map((property) => (
                  <article key={property.id} className="overflow-hidden rounded-2xl border border-neutral-200">
                    <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)] lg:p-5">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="text-base font-bold text-neutral-950">{property.title}</h4>
                            <p className="mt-1 text-xs text-neutral-600">{property.propertyType} · {property.listingType} · {property.currency} {Number(property.price).toLocaleString()}</p>
                          </div>
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-800">{property.status.replaceAll('_', ' ')}</span>
                        </div>
                        <p className="text-sm leading-6 text-neutral-700">{property.description}</p>
                        <dl className="grid gap-2 rounded-xl bg-neutral-50 p-3 text-xs sm:grid-cols-2">
                          <div><dt className="font-semibold text-neutral-500">Submitted by</dt><dd className="mt-0.5 font-medium text-neutral-900">{property.owner.fullName} · {property.owner.role || 'Owner'}</dd><dd className="text-neutral-600">{property.owner.email} {property.owner.phone ? `· ${property.owner.phone}` : ''}</dd></div>
                          <div><dt className="font-semibold text-neutral-500">Location</dt><dd className="mt-0.5 text-neutral-900">{[property.exactAddress, property.district, property.region, property.country].filter(Boolean).join(', ')}</dd><dd className="text-neutral-600">{property.latitude ?? '—'}, {property.longitude ?? '—'}</dd></div>
                        </dl>
                        {property.media.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto">
                            {property.media.filter((item) => item.isActive).map((media) => (
                              <a key={media.id} href={media.publicUrl} target="_blank" rel="noreferrer" className="shrink-0">
                                {media.kind === 'VIDEO' ? (
                                  <video src={media.publicUrl} controls className="h-24 w-36 rounded-lg bg-neutral-100 object-cover" />
                                ) : (
                                  <img src={media.publicUrl} alt={`${property.title} media`} className="h-24 w-36 rounded-lg bg-neutral-100 object-cover" />
                                )}
                              </a>
                            ))}
                          </div>
                        )}
                        {property.reviewNote && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><strong>Latest review note:</strong> {property.reviewNote}</p>}
                        <details className="rounded-lg border border-neutral-200 p-3">
                          <summary className="cursor-pointer text-xs font-semibold text-neutral-700">Approval history ({property.reviewHistory.length})</summary>
                          <ol className="mt-2 space-y-2">
                            {property.reviewHistory.map((review) => (
                              <li key={review.id} className="border-l-2 border-emerald-300 pl-3 text-xs text-neutral-600">
                                <span className="font-semibold text-neutral-900">{review.action.replaceAll('_', ' ')}</span> · {review.fromStatus} → {review.toStatus} · {new Date(review.createdAt).toLocaleString()}
                                {review.notes && <p className="mt-0.5">{review.notes}</p>}
                              </li>
                            ))}
                          </ol>
                        </details>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-neutral-800" htmlFor={`review-notes-${property.id}`}>Review notes</label>
                        <textarea
                          id={`review-notes-${property.id}`}
                          rows={5}
                          value={propertyReviewNotes[property.id] || ''}
                          onChange={(event) => setPropertyReviewNotes((current) => ({ ...current, [property.id]: event.target.value }))}
                          placeholder="Explain any required corrections or rejection reason."
                          className="w-full rounded-xl border border-neutral-300 p-3 text-sm outline-none focus:border-emerald-600"
                        />
                        <div className="grid gap-2">
                          <button type="button" onClick={() => void handlePropertyReview(property, 'approve')} className="rounded-lg bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">Approve and publish</button>
                          <button type="button" disabled={!propertyReviewNotes[property.id]?.trim()} onClick={() => void handlePropertyReview(property, 'corrections')} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-900 disabled:opacity-50">Request corrections</button>
                          <button type="button" disabled={!propertyReviewNotes[property.id]?.trim()} onClick={() => void handlePropertyReview(property, 'reject')} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-800 disabled:opacity-50">Reject property</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs sm:p-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-bold text-neutral-950">Subscription pricing and privileges</h3>
                  <p className="mt-1 text-xs text-neutral-500">All prices and discount rules are stored in the database and applied by the backend.</p>
                </div>
                <button type="button" onClick={() => void fetchSubscriptionManagement()} className="inline-flex items-center gap-2 self-start rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700">
                  <RefreshCw className={`h-4 w-4 ${subscriptionLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {subscriptionLoading && !subscriptionConfig ? (
                <p className="py-10 text-center text-sm text-neutral-500">Loading subscription settings...</p>
              ) : subscriptionConfig ? (
                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-neutral-900">Plan rules</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-semibold text-neutral-700">
                        Paid base monthly price
                        <input type="number" min="0" step="0.01" value={subscriptionConfig.baseMonthlyPrice} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, baseMonthlyPrice: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm" />
                      </label>
                      <label className="text-xs font-semibold text-neutral-700">
                        Currency (ISO code)
                        <input maxLength={3} value={subscriptionConfig.currency} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, currency: event.target.value.toUpperCase() })} className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm uppercase" />
                      </label>
                      <label className="text-xs font-semibold text-neutral-700">
                        Free plan validity (days)
                        <input type="number" min="1" max="3650" value={subscriptionConfig.freeValidityDays} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, freeValidityDays: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm" />
                      </label>
                      <label className="text-xs font-semibold text-neutral-700">
                        Free active listing limit (0 or 1)
                        <input type="number" min="0" max="1" value={subscriptionConfig.freeListingLimit} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, freeListingLimit: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm" />
                      </label>
                      <label className="text-xs font-semibold text-neutral-700">
                        Free map unlocks (0 or 1)
                        <input type="number" min="0" max="1" value={subscriptionConfig.freeMapUnlockLimit} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, freeMapUnlockLimit: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm" />
                      </label>
                      <label className="text-xs font-semibold text-neutral-700">
                        Paid active listing limit (0 = unlimited)
                        <input type="number" min="0" value={subscriptionConfig.paidListingLimit} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, paidListingLimit: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm" />
                      </label>
                      <label className="text-xs font-semibold text-neutral-700 sm:col-span-2">
                        Paid map unlock limit (0 = unlimited)
                        <input type="number" min="0" value={subscriptionConfig.paidMapUnlockLimit} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, paidMapUnlockLimit: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900">Progressive duration discounts</h4>
                        <p className="mt-1 text-[11px] text-neutral-500">Ranges must not overlap; longer ranges cannot reduce the discount.</p>
                      </div>
                      <button type="button" onClick={() => setSubscriptionConfig({ ...subscriptionConfig, discounts: [...subscriptionConfig.discounts, { minMonths: 1, maxMonths: 1, discountPercent: 0 }] })} className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700">Add range</button>
                    </div>
                    <div className="space-y-2">
                      {subscriptionConfig.discounts.map((discount, index) => (
                        <div key={discount.id || index} className="grid grid-cols-[1fr_1fr_1.2fr_auto] items-end gap-2 rounded-xl bg-neutral-50 p-3">
                          <label className="text-[10px] font-semibold text-neutral-600">From months<input type="number" min="1" max="48" value={discount.minMonths} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, discounts: subscriptionConfig.discounts.map((item, row) => row === index ? { ...item, minMonths: Number(event.target.value) } : item) })} className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-2 text-xs" /></label>
                          <label className="text-[10px] font-semibold text-neutral-600">To months<input type="number" min="1" max="48" value={discount.maxMonths} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, discounts: subscriptionConfig.discounts.map((item, row) => row === index ? { ...item, maxMonths: Number(event.target.value) } : item) })} className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-2 text-xs" /></label>
                          <label className="text-[10px] font-semibold text-neutral-600">Discount %<input type="number" min="0" max="100" step="0.01" value={discount.discountPercent} onChange={(event) => setSubscriptionConfig({ ...subscriptionConfig, discounts: subscriptionConfig.discounts.map((item, row) => row === index ? { ...item, discountPercent: Number(event.target.value) } : item) })} className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-2 text-xs" /></label>
                          <button type="button" onClick={() => setSubscriptionConfig({ ...subscriptionConfig, discounts: subscriptionConfig.discounts.filter((_, row) => row !== index) })} className="rounded-md p-2 text-rose-700 hover:bg-rose-50" aria-label="Remove discount range"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-rose-700">Subscription settings could not be loaded.</p>
              )}
              <div className="mt-6 border-t border-neutral-100 pt-4">
                <button type="button" disabled={!subscriptionConfig || subscriptionSaving} onClick={() => void handleSaveSubscriptionConfig()} className="rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white disabled:opacity-50">
                  {subscriptionSaving ? 'Saving settings...' : 'Save subscription settings'}
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs sm:p-7">
              <h3 className="text-lg font-bold text-neutral-950">Manually grant a subscription</h3>
              <p className="mt-1 text-xs text-neutral-500">Manual grants require a reason and create an audit record. Grants replace the user’s currently active plan.</p>
              <form onSubmit={handleGrantSubscription} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <label className="text-xs font-semibold text-neutral-700 xl:col-span-2">Owner or broker
                  <select required value={grantUserId} onChange={(event) => setGrantUserId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm">
                    <option value="">Select a user</option>
                    {subscriptionUsers.map((user) => <option key={user.id} value={user.id}>{user.fullName} · {user.email} · {user.role}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-neutral-700">Plan
                  <select value={grantPlan} onChange={(event) => setGrantPlan(event.target.value as 'FREE' | 'PAID')} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm">
                    <option value="FREE">Free</option><option value="PAID">Paid</option>
                  </select>
                </label>
                {grantPlan === 'PAID' && <label className="text-xs font-semibold text-neutral-700">Duration (months)
                  <select value={grantDuration} onChange={(event) => setGrantDuration(Number(event.target.value))} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm">
                    {Array.from({ length: 48 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>{month} month{month === 1 ? '' : 's'}</option>)}
                  </select>
                </label>}
                <label className="text-xs font-semibold text-neutral-700 xl:col-span-3">Audit reason
                  <input required minLength={8} value={grantReason} onChange={(event) => setGrantReason(event.target.value)} placeholder="Explain why this subscription is being granted" className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm" />
                </label>
                <button type="submit" disabled={!grantUserId || !grantReason.trim()} className="self-end rounded-xl bg-emerald-700 px-5 py-3 text-xs font-bold text-white disabled:opacity-50">Grant subscription</button>
              </form>
            </section>

            <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xs">
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div><h3 className="text-lg font-bold text-neutral-950">Subscriptions and payment transactions</h3><p className="mt-1 text-xs text-neutral-500">Review active, expired, pending, and manually granted subscription history.</p></div>
                <select value={subscriptionFilter} onChange={(event) => setSubscriptionFilter(event.target.value)} className="rounded-lg border border-neutral-300 px-3 py-2 text-xs">
                  {['ALL', 'ACTIVE', 'EXPIRED', 'PENDING_PAYMENT', 'REVOKED', 'FAILED'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                </select>
              </div>
              {subscriptionLoading ? <p className="py-10 text-center text-sm text-neutral-500">Loading subscription ledger...</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-xs">
                    <thead className="bg-neutral-50 uppercase tracking-wide text-neutral-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status / Validity</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment reference</th><th className="px-4 py-3">Action</th></tr></thead>
                    <tbody className="divide-y divide-neutral-100">
                      {subscriptionRows.map((row) => {
                        const payment = row.payments[0];
                        return <tr key={row.id}>
                          <td className="px-4 py-3"><strong>{row.user.fullName}</strong><p className="text-neutral-500">{row.user.email}</p><p className="font-mono text-[10px] text-neutral-400">{row.userId}</p></td>
                          <td className="px-4 py-3">{row.plan}{row.durationMonths ? ` · ${row.durationMonths} mo` : ''}</td>
                          <td className="px-4 py-3">{row.status}<p className="mt-1 text-neutral-500">{row.startsAt ? new Date(row.startsAt).toLocaleDateString() : 'Pending'} – {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : '—'}</p></td>
                          <td className="px-4 py-3 font-semibold">{row.currency} {Number(row.totalAmount).toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono text-[10px]">{payment?.gatewayReference || payment?.id || 'No payment record'}{payment && <p className="mt-1 font-sans text-neutral-500">{payment.status}</p>}</td>
                          <td className="px-4 py-3">{row.status === 'ACTIVE' || row.status === 'PENDING_PAYMENT' ? <button type="button" onClick={() => { setRevocationTarget(row); setRevocationReason(''); }} className="rounded-lg bg-rose-50 px-3 py-2 font-semibold text-rose-700">Revoke</button> : '—'}</td>
                        </tr>;
                      })}
                      {subscriptionRows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-500">No subscriptions in this status.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
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

        {revocationTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form onSubmit={(event) => { event.preventDefault(); void handleRevokeSubscription(); }} className="w-full max-w-md space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
              <h3 className="text-base font-bold text-neutral-950">Revoke subscription</h3>
              <p className="text-xs text-neutral-600">Revoke {revocationTarget.plan} access for {revocationTarget.user.fullName}. The reason is saved to the administrator audit log.</p>
              <label className="block text-xs font-semibold text-neutral-800">Mandatory audit reason
                <textarea required minLength={8} rows={4} value={revocationReason} onChange={(event) => setRevocationReason(event.target.value)} className="mt-1.5 w-full rounded-xl border border-neutral-300 p-3 text-sm" />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRevocationTarget(null)} className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100">Cancel</button>
                <button type="submit" disabled={revocationReason.trim().length < 8} className="rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Confirm revoke</button>
              </div>
            </form>
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
