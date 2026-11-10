import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  ShieldCheck,
  Settings,
  Bell,
  ExternalLink,
  Upload,
  User,
  MapPin,
  Coins
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { SUPPORTED_CURRENCY_CODES } from '../utils/currency';
import { POPULAR_COUNTRIES } from '../data/mockLocations';
import { updateProfileWithBackend } from '../services/authApi';
import { ProfileSettings } from '../components/ProfileSettings';
import { getMySubscription, UserSubscriptionSummary } from '../services/subscriptionApi';
import { getMyBackendProperties, OwnerPropertyRecord, resubmitBackendProperty } from '../services/propertyApi';

type DashboardTab =
  | 'overview'
  | 'my-properties'
  | 'enquiries'
  | 'agency-profile'
  | 'verification-request'
  | 'settings';

export const SellerDashboardPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    userCurrency,
    setCurrentPage,
    enquiries,
    showNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [subscriptionSummary, setSubscriptionSummary] = useState<UserSubscriptionSummary | null>(null);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [backendProperties, setBackendProperties] = useState<OwnerPropertyRecord[]>([]);
  const [backendPropertiesLoading, setBackendPropertiesLoading] = useState(true);
  const [backendPropertiesError, setBackendPropertiesError] = useState('');
  const [editingBackendProperty, setEditingBackendProperty] = useState<string | null>(null);
  const [backendEditTitle, setBackendEditTitle] = useState('');
  const [backendEditDescription, setBackendEditDescription] = useState('');
  const [backendEditPrice, setBackendEditPrice] = useState('');
  const [savingBackendProperty, setSavingBackendProperty] = useState(false);

  useEffect(() => {
    let active = true;
    getMySubscription().then((summary) => {
      if (active) setSubscriptionSummary(summary);
    }).catch((error: unknown) => {
      if (active) setSubscriptionError(error instanceof Error ? error.message : 'Unable to load subscription details.');
    });
    return () => { active = false; };
  }, [currentUser.id]);

  useEffect(() => {
    let active = true;
    setBackendPropertiesLoading(true);
    getMyBackendProperties().then((records) => {
      if (active) setBackendProperties(records);
    }).catch((error: unknown) => {
      if (active) setBackendPropertiesError(error instanceof Error ? error.message : 'Unable to load submitted properties.');
    }).finally(() => {
      if (active) setBackendPropertiesLoading(false);
    });
    return () => { active = false; };
  }, [currentUser.id]);

  useEffect(() => {
    const handleDashboardSection = (event: Event) => {
      setActiveTab((event as CustomEvent<DashboardTab>).detail);
    };

    window.addEventListener('sheltered-dashboard-section', handleDashboardSection);
    return () => window.removeEventListener('sheltered-dashboard-section', handleDashboardSection);
  }, []);
  const [propertyFilterStatus, setPropertyFilterStatus] = useState<string>('all');
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Profile form state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileCountry, setProfileCountry] = useState(currentUser.country || '');
  const [profileRegion, setProfileRegion] = useState(currentUser.region || '');
  const [profileDistrict, setProfileDistrict] = useState(currentUser.district || '');
  const [profileNeighborhood, setProfileNeighborhood] = useState(currentUser.neighborhood || '');
  const [companyName, setCompanyName] = useState(currentUser.companyName || '');
  const [agencyLicense, setAgencyLicense] = useState(currentUser.agencyLicense || '');
  const [profileBio, setProfileBio] = useState(currentUser.bio || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Verification request form state
  const [idDocUploaded, setIdDocUploaded] = useState(false);
  const [deedDocUploaded, setDeedDocUploaded] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  const myProperties = backendProperties;

  const filteredBackendProperties = backendProperties.filter((property) => {
    if (propertyFilterStatus === 'all') return true;
    if (propertyFilterStatus === 'published') return property.status === 'ACTIVE' || property.status === 'APPROVED';
    if (propertyFilterStatus === 'pending') return property.status === 'PENDING_REVIEW' || property.status === 'CORRECTION_REQUESTED';
    if (propertyFilterStatus === 'draft') return property.status === 'DRAFT';
    if (propertyFilterStatus === 'rejected') return property.status === 'REJECTED';
    if (propertyFilterStatus === 'sold-rented') return property.status === 'SOLD' || property.status === 'RENTED';
    return true;
  });

  const handleResubmitProperty = async (event: React.FormEvent, propertyId: string) => {
    event.preventDefault();
    const price = Number(backendEditPrice);
    if (!backendEditTitle.trim() || !backendEditDescription.trim() || !Number.isFinite(price) || price <= 0) {
      setBackendPropertiesError('Enter a title, description, and positive price before resubmitting.');
      return;
    }
    setSavingBackendProperty(true);
    setBackendPropertiesError('');
    try {
      await resubmitBackendProperty(propertyId, {
        title: backendEditTitle.trim(),
        description: backendEditDescription.trim(),
        price
      });
      setBackendProperties(await getMyBackendProperties());
      setEditingBackendProperty(null);
      showNotification('Property updated and resubmitted for administrator review.', 'success');
    } catch (error) {
      setBackendPropertiesError(error instanceof Error ? error.message : 'Unable to resubmit this property.');
    } finally {
      setSavingBackendProperty(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const updatedProfile = await updateProfileWithBackend({
        fullName: profileName,
        phone: profilePhone,
        country: profileCountry,
        region: profileRegion,
        district: profileDistrict,
        neighborhood: profileNeighborhood,
        companyName,
        agencyLicense,
        bio: profileBio
      });
      setCurrentUser(updatedProfile);
      showNotification('Profile and preferred location saved.', 'success');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendReply = (enquiryId: string) => {
    if (!replyText.trim()) return;
    showNotification('Reply message sent to client via email relay.', 'success');
    setReplyText('');
    setReplyMessageId(null);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationSubmitted(true);
    setCurrentUser({
      ...currentUser,
      verificationStatus: 'Pending Review'
    });
    showNotification('Verification request submitted for compliance inspection.', 'success');
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={currentUser.name}
              className="h-16 w-16 shrink-0 rounded-full border-2 border-slate-200 object-cover"
            />
            <div className="min-w-0">
              <div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                <h1 className="max-w-full truncate whitespace-nowrap text-lg font-bold text-slate-900 sm:text-xl">{currentUser.name}</h1>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium capitalize">
                    {currentUser.role}
                  </span>
                {currentUser.verificationStatus === 'Verified' ? (
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Broker</span>
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">
                    {currentUser.verificationStatus || 'Unverified'}
                  </span>
                )}
                </div>
              </div>
              <p className="mt-1 break-words text-[11px] leading-snug text-slate-500 sm:text-xs">
                {currentUser.companyName ? `${currentUser.companyName} · ` : ''}
                  {currentUser.email} · {[currentUser.neighborhood, currentUser.district, currentUser.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCurrentPage('list-property')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Property</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition"
            >
              Public Marketplace
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="hidden items-center gap-1 overflow-x-auto border-b border-slate-200 pb-1 text-xs font-medium text-slate-600 lg:flex">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'my-properties', label: `My Properties (${myProperties.length})`, icon: Building },
            { id: 'enquiries', label: `Enquiries (${enquiries.length})`, icon: Mail },
            { id: 'agency-profile', label: 'Profile & Location', icon: User },
            { id: 'verification-request', label: 'Verification Request', icon: ShieldCheck },
            { id: 'settings', label: 'Account Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold border-t-2 border-slate-900 shadow-xs'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Subscription</p>
                  {subscriptionSummary?.current ? (
                    <>
                      <h2 className="mt-1 text-lg font-bold text-slate-950">
                        {subscriptionSummary.current.plan} Plan · {subscriptionSummary.current.status}
                      </h2>
                      <p className="mt-1 text-xs text-slate-600">
                        Started {subscriptionSummary.current.startsAt ? new Date(subscriptionSummary.current.startsAt).toLocaleDateString() : '—'}
                        {' · '}expires {subscriptionSummary.current.expiresAt ? new Date(subscriptionSummary.current.expiresAt).toLocaleDateString() : '—'}
                        {subscriptionSummary.current.expiresAt
                          ? ` · ${Math.max(0, Math.ceil((new Date(subscriptionSummary.current.expiresAt).getTime() - Date.now()) / 86400000))} days remaining`
                          : ''}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Listings {subscriptionSummary.privileges.listingsUsed} / {subscriptionSummary.privileges.listingLimit === 0
                          ? (subscriptionSummary.current.plan === 'FREE' ? 'None' : 'Unlimited')
                          : subscriptionSummary.privileges.listingLimit}
                        {' · '}map unlocks {subscriptionSummary.privileges.mapUnlocksUsed} / {subscriptionSummary.privileges.mapUnlockLimit === 0
                          ? (subscriptionSummary.current.plan === 'FREE' ? 'None' : 'Unlimited')
                          : subscriptionSummary.privileges.mapUnlockLimit}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-1 text-lg font-bold text-slate-950">
                        {subscriptionSummary?.history[0]?.status === 'EXPIRED' ? 'Subscription expired' : 'No active subscription'}
                      </h2>
                      <p className="mt-1 text-xs text-slate-600">
                        {subscriptionSummary?.history[0]?.expiresAt
                          ? `Last plan expired ${new Date(subscriptionSummary.history[0].expiresAt).toLocaleDateString()}.`
                          : 'Choose a plan to activate listing and map privileges.'}
                      </p>
                    </>
                  )}
                  {subscriptionError && <p className="mt-2 text-xs text-rose-700">{subscriptionError}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage('subscription')}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  {subscriptionSummary?.current?.plan === 'PAID' ? 'Renew / manage plan' : 'Choose or upgrade plan'}
                </button>
              </div>
            </section>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Active Published Listings</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {myProperties.filter((p) => p.status === 'ACTIVE' || p.status === 'APPROVED').length}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">Live on Global Marketplace</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Total Buyer Impressions</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {myProperties.reduce((sum, p) => sum + p.viewsCount, 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Across web & mobile</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Awaiting Admin Review</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {myProperties.filter((p) => ['PENDING_REVIEW', 'CORRECTION_REQUESTED'].includes(p.status)).length}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Submitted for verification</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Client Inquiries</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {enquiries.length}
                </div>
                <div className="text-[11px] text-blue-600 mt-1">Direct message leads</div>
              </div>
            </div>

            {/* Recent Listings Preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Property Listings</h3>
                  <p className="text-xs text-slate-500">Quickly monitor and update your portfolio status</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('my-properties')}
                  className="text-xs font-semibold text-slate-900 hover:underline"
                >
                  View All ({myProperties.length})
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {myProperties.slice(0, 4).map((property) => (
                  <div key={property.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {property.media.find((media) => media.kind === 'IMAGE') && (
                        <img
                          src={property.media.find((media) => media.kind === 'IMAGE')?.thumbnailUrl
                            || property.media.find((media) => media.kind === 'IMAGE')?.publicUrl}
                          alt={property.title}
                          className="w-14 h-12 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {property.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {property.country} · {property.district} · {property.currency} {Number(property.price).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        property.status === 'ACTIVE' || property.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : property.status === 'PENDING_REVIEW' || property.status === 'CORRECTION_REQUESTED'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {property.status.replaceAll('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY PROPERTIES */}
        {activeTab === 'my-properties' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            {/* Filter Tabs by Listing Status */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Listings' },
                  { id: 'published', label: 'Published / Live' },
                  { id: 'pending', label: 'Pending Review' },
                  { id: 'draft', label: 'Drafts' },
                  { id: 'rejected', label: 'Rejected' },
                  { id: 'sold-rented', label: 'Sold / Rented' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPropertyFilterStatus(s.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                      propertyFilterStatus === s.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage('list-property')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Property</span>
              </button>
            </div>

            {backendPropertiesError && (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {backendPropertiesError}
              </p>
            )}
            {backendPropertiesLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">Loading your submitted properties...</p>
            ) : filteredBackendProperties.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No submitted properties in this category</h4>
                <p className="text-xs text-slate-500 mt-1">New listings are saved to your account as pending admin review.</p>
                <button
                  type="button"
                  onClick={() => setCurrentPage('list-property')}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                >
                  List a Property
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredBackendProperties.map((property) => {
                  const image = property.media.find((media) => media.kind === 'IMAGE');
                  const isEditing = editingBackendProperty === property.id;
                  return (
                    <article key={property.id} className="py-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        {image && (
                          <img
                            src={image.thumbnailUrl || image.publicUrl}
                            alt={property.title}
                            className="h-20 w-28 shrink-0 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{property.title}</h3>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700">
                              {property.status.replaceAll('_', ' ')}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {property.propertyType} · {property.listingType} · {property.currency} {Number(property.price).toLocaleString()}
                          </p>
                          {property.reviewNote && (
                            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                              Administrator note: {property.reviewNote}
                            </p>
                          )}
                          {property.reviewHistory.length > 0 && (
                            <details className="mt-2 text-xs text-slate-600">
                              <summary className="cursor-pointer font-semibold">Approval history ({property.reviewHistory.length})</summary>
                              <ul className="mt-2 space-y-1">
                                {property.reviewHistory.map((review) => (
                                  <li key={review.id}>
                                    {new Date(review.createdAt).toLocaleString()} · {review.action.replaceAll('_', ' ')}
                                    {review.notes ? ` — ${review.notes}` : ''}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
                          {isEditing && (
                            <form onSubmit={(event) => void handleResubmitProperty(event, property.id)} className="mt-3 space-y-2">
                              <input
                                aria-label="Property title"
                                value={backendEditTitle}
                                onChange={(event) => setBackendEditTitle(event.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                                required
                              />
                              <textarea
                                aria-label="Property description"
                                value={backendEditDescription}
                                onChange={(event) => setBackendEditDescription(event.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                                rows={3}
                                required
                              />
                              <input
                                aria-label="Property price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={backendEditPrice}
                                onChange={(event) => setBackendEditPrice(event.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                                required
                              />
                              <div className="flex gap-2">
                                <button disabled={savingBackendProperty} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                                  {savingBackendProperty ? 'Resubmitting...' : 'Save and resubmit for review'}
                                </button>
                                <button type="button" onClick={() => setEditingBackendProperty(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBackendProperty(property.id);
                              setBackendEditTitle(property.title);
                              setBackendEditDescription(property.description);
                              setBackendEditPrice(String(property.price));
                            }}
                            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit and resubmit
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ENQUIRIES & MESSAGES */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Buyer & Tenant Enquiries</h3>
              <p className="text-xs text-slate-500">Inbound inquiries received for your properties</p>
            </div>

            {enquiries.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No enquiries received yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  When prospective buyers contact you through the public marketplace, messages appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{enq.userName}</span>
                        <span className="text-xs text-slate-500">&lt;{enq.userEmail}&gt;</span>
                        <span className="text-xs text-slate-400">· {enq.userPhone}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-700">
                      Property Ref: <span className="text-slate-900">{enq.propertyTitle}</span>
                    </div>
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                      &quot;{enq.message}&quot;
                    </div>

                    {replyMessageId === enq.id ? (
                      <div className="pt-2 space-y-2">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your response to the client..."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendReply(enq.id)}
                            className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold"
                          >
                            Send Email Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyMessageId(null)}
                            className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setReplyMessageId(enq.id)}
                          className="text-xs font-semibold text-slate-900 hover:underline"
                        >
                          Reply to Client
                        </button>
                        <span className="text-slate-300">·</span>
                        <a
                          href={`tel:${enq.userPhone}`}
                          className="text-xs text-slate-600 hover:text-slate-900"
                        >
                          Call Client
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AGENCY PROFILE */}
        {activeTab === 'agency-profile' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Profile & Preferred Location</h3>
              <p className="text-xs text-slate-500">Your profile is saved to your account. Buyers use their preferred area to filter listings.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
              {profileError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{profileError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    readOnly
                    aria-describedby="profile-email-note"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-500"
                  />
                  <p id="profile-email-note" className="mt-1 text-[10px] text-slate-500">Contact support to change your sign-in email.</p>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <h4 className="text-xs font-bold text-slate-800">Preferred search area</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-xs font-semibold text-slate-700">
                    Country
                    <select value={profileCountry} onChange={(e) => setProfileCountry(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs">
                      <option value="">Choose a country</option>
                      {POPULAR_COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Region / State
                    <input value={profileRegion} onChange={(e) => setProfileRegion(e.target.value)} maxLength={120} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    City / District
                    <input value={profileDistrict} onChange={(e) => setProfileDistrict(e.target.value)} maxLength={120} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Neighborhood
                    <input value={profileNeighborhood} onChange={(e) => setProfileNeighborhood(e.target.value)} maxLength={120} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Real Estate Firm
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Elgon Crest Properties Ltd"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  License / Registration Number
                </label>
                <input
                  type="text"
                  value={agencyLicense}
                  onChange={(e) => setAgencyLicense(e.target.value)}
                  placeholder="e.g. UG-MBL-REA-0042"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Bio / Agency Specialty
                </label>
                <textarea
                  rows={4}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                {isSavingProfile ? 'Saving…' : 'Save Profile & Location'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: VERIFICATION REQUEST */}
        {activeTab === 'verification-request' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-slate-900">Seller & Title Deed Verification</h3>
              <p className="text-xs text-slate-500">
                Verified sellers receive higher buyer trust and prominent placement across the Sheltered marketplace.
              </p>
            </div>

            {verificationSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Verification Request Submitted</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Our compliance team at Sheltered headquarters (Mbale, Uganda) is reviewing your legal identity and property title documents. You will receive an email update once processed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <span className="text-xs font-bold text-slate-800">Verification Steps:</span>
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    <li>Valid government-issued National ID or International Passport</li>
                    <li>Certificate of Title / Deed Registry Search document for private owners</li>
                    <li>Real Estate Board license or certificate of incorporation for agencies</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      1. National ID or Passport (PDF / Image)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIdDocUploaded(true)}
                        className="px-3 py-2 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-600 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{idDocUploaded ? 'national_id_verified.pdf' : 'Choose Document File'}</span>
                      </button>
                      {idDocUploaded && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      2. Land Title / Agency Incorporation Document
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDeedDocUploaded(true)}
                        className="px-3 py-2 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-600 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{deedDocUploaded ? 'title_deed_registry_doc.pdf' : 'Choose Title / License File'}</span>
                      </button>
                      {deedDocUploaded && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  Submit for Verification
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-2xl">
            <ProfileSettings
              currentUser={currentUser}
              onSaved={setCurrentUser}
              showNotification={showNotification}
            />
            <hr className="border-slate-200" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Account & Notification Preferences</h3>
              <p className="text-xs text-slate-500">Manage language, currency, and security notifications</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <div className="text-xs font-bold text-slate-800">Email Notifications for New Leads</div>
                  <div className="text-[11px] text-slate-500">Get notified immediately when a buyer submits an inquiry</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <div className="text-xs font-bold text-slate-800">Viewing Tour Reminders</div>
                  <div className="text-[11px] text-slate-500">SMS & email reminders for scheduled client appointments</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <div className="text-xs font-bold text-slate-800">Weekly Performance Report</div>
                  <div className="text-[11px] text-slate-500">Listing traffic, search views, and buyer engagement statistics</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
