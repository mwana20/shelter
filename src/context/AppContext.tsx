import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Property,
  PropertyStatus,
  ViewingRequest,
  EnquiryMessage,
  UserProfile,
  FilterState,
  ListingType,
  CompanySettings,
  PaymentTransaction,
  TransactionalEmail,
  AuditLog,
  LocationLockSettings,
  UnlockedLocationData
} from '../types';
import { CurrencyCode } from '../utils/currency';
import { mockProperties } from '../data/mockProperties';
import { GLOBAL_LOCATIONS, LocationHierarchyNode } from '../data/mockLocations';
import { getStoredEmails, saveStoredEmails } from '../services/authSecurity';
import { RTL_LANGUAGES } from '../i18n/languages';
import { getTranslation, TranslationKey } from '../i18n/translations';
import i18n from '../i18n';
import {
  NavigationRoute,
  buildRouteHash,
  parseRouteFromLocation,
  saveActiveRoute,
  normalizePage
} from '../utils/navigation';
import { backendApi, DEFAULT_LOCK_SETTINGS } from '../services/backendApi';

export interface AppContextType {
  // Navigation & Routing
  currentPage: string;
  setCurrentPage: (page: string, token?: string | null) => void;
  selectedPropertyId: string | null;
  openPropertyDetail: (id: string) => void;
  selectedAreaFilter: string | null;
  setSelectedAreaFilter: (area: string | null) => void;
  activeRouteToken: string | null;
  setActiveRouteToken: (token: string | null) => void;

  // Location Locking & Paid Unlocking
  locationLockSettings: LocationLockSettings;
  updateLocationLockSettings: (settings: Partial<LocationLockSettings>) => Promise<boolean>;
  isPropertyLocationLocked: (propertyId: string) => boolean;
  unlockedLocations: Record<string, UnlockedLocationData>;
  unlockModalProperty: Property | null;
  openLocationUnlock: (property: Property) => void;
  closeLocationUnlock: () => void;
  refreshLocationData: (propertyId: string) => Promise<void>;

  // Multilingual & RTL
  userLanguage: string;
  setUserLanguage: (lang: string) => void;
  isRtl: boolean;
  t: (key: TranslationKey, fallback?: string) => string;

  // Currency
  userCurrency: CurrencyCode;
  setUserCurrency: (curr: CurrencyCode) => void;

  // Company Settings (Mbale, Uganda Global HQ)
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;

  // Global Locations
  locations: LocationHierarchyNode[];
  importLocationsCsv: (csvText: string) => { added: number; error?: string };

  // Property Data & Mutations
  properties: Property[];
  availableProperties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'viewsCount' | 'savesCount' | 'dateAdded'>) => void;
  updatePropertyStatus: (id: string, status: PropertyStatus) => void;
  toggleVerifiedStatus: (id: string) => void;
  deleteProperty: (id: string) => void;
  approveProperty: (id: string, notes?: string) => void;
  rejectProperty: (id: string, reason?: string) => void;
  incrementViews: (id: string) => void;

  // User & Auth
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isAuthenticated: boolean;
  logout: () => void;
  isAdmin: boolean;

  // Security, OTP & Email Logs
  otpModalOpen: boolean;
  setOtpModalOpen: (open: boolean) => void;
  transactionalEmails: TransactionalEmail[];
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, targetType: AuditLog['targetType'], targetId?: string) => void;

  // Payments & Checkout
  paymentTransactions: PaymentTransaction[];
  addPaymentTransaction: (tx: PaymentTransaction) => void;
  checkoutModalState: {
    isOpen: boolean;
    purpose: 'listing_fee' | 'featured_promotion' | 'agent_subscription' | 'verification_inspection';
    title: string;
    amount: number;
    propertyId?: string;
  };
  openCheckout: (data: {
    purpose: 'listing_fee' | 'featured_promotion' | 'agent_subscription' | 'verification_inspection';
    title: string;
    amount: number;
    propertyId?: string;
  }) => void;
  closeCheckout: () => void;

  // Favorites & Comparisons
  savedPropertyIds: string[];
  toggleSaveProperty: (id: string) => void;
  isSaved: (id: string) => boolean;
  comparedPropertyIds: string[];
  toggleCompareProperty: (id: string) => void;
  clearComparison: () => void;
  isCompared: (id: string) => boolean;

  // Viewing Requests & Enquiries
  viewingRequests: ViewingRequest[];
  addViewingRequest: (request: Omit<ViewingRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateViewingStatus: (id: string, status: ViewingRequest['status']) => void;
  enquiries: EnquiryMessage[];
  addEnquiry: (enquiry: Omit<EnquiryMessage, 'id' | 'createdAt' | 'status'>) => void;

  // Search & Filtering
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  applyQuickSearch: (params: {
    listingType?: ListingType;
    country?: string;
    region?: string;
    district?: string;
    neighborhood?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number | 'Any';
  }) => void;

  // Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  scheduleModalProperty: Property | null;
  setScheduleModalProperty: (prop: Property | null) => void;
  contactModalProperty: Property | null;
  setContactModalProperty: (prop: Property | null) => void;
  reportModalProperty: Property | null;
  setReportModalProperty: (prop: Property | null) => void;
  galleryModalData: { images: string[]; initialIndex: number } | null;
  setGalleryModalData: (data: { images: string[]; initialIndex: number } | null) => void;
  compareModalOpen: boolean;
  setCompareModalOpen: (open: boolean) => void;

  // Toast / Feedback
  showNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

import { SHELTERED_COMPANY_CONFIG } from '../config/company';
import { clearAuthSession, getAccessToken, getAuthenticatedUser } from '../services/authApi';

const defaultCompanySettings: CompanySettings = SHELTERED_COMPANY_CONFIG;

const defaultFilters: FilterState = {
  listingType: 'All',
  country: '',
  region: '',
  district: '',
  propertyType: '',
  minPrice: undefined,
  maxPrice: undefined,
  currency: 'USD',
  bedrooms: 'Any',
  bathrooms: 'Any',
  amenities: [],
  searchQuery: '',
  sortBy: 'recommended'
};

const guestUser: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  role: 'buyer',
  emailVerified: false,
  phoneVerified: false,
  preferredLanguage: 'en',
  preferredCurrency: 'USD',
  termsAccepted: false,
  privacyAcknowledged: false
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial route loaded from URL hash, query params, or session storage
  const [initialRoute] = useState<NavigationRoute>(() => parseRouteFromLocation());
  const [currentPage, setCurrentPageState] = useState<string>(initialRoute.page);
  const [selectedPropertyId, setSelectedPropertyIdState] = useState<string | null>(initialRoute.propertyId);
  const [selectedAreaFilter, setSelectedAreaFilterState] = useState<string | null>(initialRoute.areaFilter);
  const [activeRouteToken, setActiveRouteToken] = useState<string | null>(initialRoute.token || null);

  // Sync initial URL and state on mount
  useEffect(() => {
    const route = parseRouteFromLocation();
    const targetHash = buildRouteHash(route.page, route.propertyId, route.areaFilter, route.token);
    saveActiveRoute(route);

    if (window.location.hash !== targetHash) {
      window.history.replaceState(route, '', targetHash);
    } else if (!window.history.state) {
      window.history.replaceState(route, '', window.location.href);
    }
  }, []);

  // Listen to browser Back and Forward navigation events
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as NavigationRoute | null;
      let targetRoute: NavigationRoute;

      if (state && state.page) {
        targetRoute = {
          page: normalizePage(state.page),
          propertyId: state.propertyId || null,
          areaFilter: state.areaFilter || null,
          token: state.token || null
        };
      } else {
        targetRoute = parseRouteFromLocation();
      }

      setCurrentPageState(targetRoute.page);
      setSelectedPropertyIdState(targetRoute.propertyId);
      setSelectedAreaFilterState(targetRoute.areaFilter);
      setActiveRouteToken(targetRoute.token || null);
      saveActiveRoute(targetRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleHashChange = () => {
      const targetRoute = parseRouteFromLocation();
      setCurrentPageState(targetRoute.page);
      setSelectedPropertyIdState(targetRoute.propertyId);
      setSelectedAreaFilterState(targetRoute.areaFilter);
      setActiveRouteToken(targetRoute.token || null);
      saveActiveRoute(targetRoute);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const setCurrentPage = (pageInput: string, tokenParam?: string | null) => {
    const norm = normalizePage(pageInput);
    const token = tokenParam !== undefined ? tokenParam : norm === 'reset-password' || norm === 'email-verification' ? activeRouteToken : null;
    const newRoute: NavigationRoute = {
      page: norm,
      propertyId: norm === 'property-detail' ? selectedPropertyId : null,
      areaFilter: norm === 'areas' ? selectedAreaFilter : null,
      token
    };

    setCurrentPageState(norm);
    setActiveRouteToken(token);
    if (norm !== 'property-detail') {
      setSelectedPropertyIdState(null);
    }
    saveActiveRoute(newRoute);

    const targetHash = buildRouteHash(newRoute.page, newRoute.propertyId, newRoute.areaFilter, newRoute.token);
    if (window.location.hash !== targetHash) {
      window.history.pushState(newRoute, '', targetHash);
    }
  };

  const setSelectedAreaFilter = (area: string | null) => {
    setSelectedAreaFilterState(area);
    if (currentPage === 'areas') {
      const newRoute: NavigationRoute = {
        page: 'areas',
        propertyId: null,
        areaFilter: area
      };
      saveActiveRoute(newRoute);
      const targetHash = buildRouteHash('areas', null, area);
      if (window.location.hash !== targetHash) {
        window.history.pushState(newRoute, '', targetHash);
      }
    }
  };

  // Language & RTL State
  const [userLanguage, setUserLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('sheltered_user_lang_v3');
      if (saved) return saved;
      // Auto-detect browser language
      const browserLang = navigator.language.slice(0, 2);
      return ['en', 'fr', 'sw', 'ar', 'es', 'pt', 'de', 'zh', 'hi', 'ur', 'ru', 'fa'].includes(browserLang)
        ? browserLang
        : 'en';
    } catch {
      return 'en';
    }
  });

  const isRtl = RTL_LANGUAGES.includes(userLanguage);

  const setUserLanguage = (lang: string) => {
    setUserLanguageState(lang);
    try {
      localStorage.setItem('sheltered_user_lang_v3', lang);
    } catch {
      // ignore
    }
    i18n.changeLanguage(lang);
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // Sync HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = userLanguage;
    i18n.changeLanguage(userLanguage);
  }, [userLanguage, isRtl]);

  const t = (key: TranslationKey, fallback?: string): string => {
    const translated = getTranslation(userLanguage, key);
    return translated || fallback || key;
  };

  // Currency State
  const [userCurrency, setUserCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('sheltered_user_currency_v3');
      return (saved as CurrencyCode) || 'UGX';
    } catch {
      return 'UGX';
    }
  });

  const setUserCurrency = (curr: CurrencyCode) => {
    setUserCurrencyState(curr);
    try {
      localStorage.setItem('sheltered_user_currency_v3', curr);
    } catch {
      // ignore
    }
  };

  // Company Settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem('sheltered_company_settings_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultCompanySettings;
  });

  const updateCompanySettings = (updated: Partial<CompanySettings>) => {
    setCompanySettings((prev) => {
      const neu = { ...prev, ...updated };
      try {
        localStorage.setItem('sheltered_company_settings_v3', JSON.stringify(neu));
      } catch {
        // ignore
      }
      return neu;
    });
    showNotification('Company settings saved successfully.', 'success');
  };

  // Global Locations
  const [locations, setLocations] = useState<LocationHierarchyNode[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_locations_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return GLOBAL_LOCATIONS;
  });

  const importLocationsCsv = (csvText: string): { added: number; error?: string } => {
    try {
      const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
      let count = 0;
      // Simple parser: Country, Region, District, Subcounty, Neighborhood
      lines.slice(1).forEach((line) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 3) {
          count++;
        }
      });
      return { added: count };
    } catch (err: any) {
      return { added: 0, error: err.message };
    }
  };

  // Property Listings State
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_mukono_properties_v5');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return mockProperties;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sheltered_mukono_properties_v5', JSON.stringify(properties));
    } catch {
      // ignore
    }
  }, [properties]);

  // Saved / Favorited Properties
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_saved_ids_v5');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['prop-1', 'prop-2', 'prop-5'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sheltered_saved_ids_v5', JSON.stringify(savedPropertyIds));
    } catch {
      // ignore
    }
  }, [savedPropertyIds]);

  // Compared Properties
  const [comparedPropertyIds, setComparedPropertyIds] = useState<string[]>([]);

  // Viewing Requests
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_viewings_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'viewing-mbale-1',
        propertyId: 'prop-mbale-1',
        propertyTitle: 'Prestigious 5-Bedroom Colonial Villa in Senior Quarters, Mbale',
        propertyPrice: 680000000,
        propertyCurrency: 'UGX',
        propertyImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85',
        listingType: 'Sale',
        date: '2026-10-20',
        timeSlot: '10:00 AM - 11:30 AM',
        userName: 'Phillip Mwanaweika',
        userPhone: '+256 701 884 902',
        userEmail: 'phillipmwanaweika@gmail.com',
        notes: 'Would like to inspect boundary markers and borehole sweet water pressure.',
        status: 'Confirmed',
        createdAt: '2026-10-14T10:00:00Z'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sheltered_viewings_v3', JSON.stringify(viewingRequests));
    } catch {
      // ignore
    }
  }, [viewingRequests]);

  // Enquiries
  const [enquiries, setEnquiries] = useState<EnquiryMessage[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_enquiries_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'enquiry-1',
        propertyId: 'prop-mbale-2',
        propertyTitle: 'Prime 4-Storey Commercial Plaza on Republic Street, Mbale',
        userName: 'Phillip Mwanaweika',
        userEmail: 'phillipmwanaweika@gmail.com',
        userPhone: '+256 701 884 902',
        message: 'Is the asking price slightly negotiable if payment is structured in USD through bank wire?',
        createdAt: '2026-10-13T09:12:00Z',
        status: 'Replied'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sheltered_enquiries_v3', JSON.stringify(enquiries));
    } catch {
      // ignore
    }
  }, [enquiries]);

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(guestUser);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    localStorage.removeItem('sheltered_current_user_v3');
    if (!getAccessToken()) {
      setAuthReady(true);
      return;
    }

    let active = true;
    getAuthenticatedUser()
      .then((user) => {
        if (active) setCurrentUser(user);
      })
      .catch(() => {
        clearAuthSession();
        if (active) setCurrentUser(guestUser);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const isAuthenticated = authReady && Boolean(currentUser.id) && Boolean(getAccessToken());
  const isAdmin = isAuthenticated && (currentUser.role === 'admin' || currentUser.role === 'superadmin');

  const logout = () => {
    clearAuthSession();
    setCurrentUser(guestUser);
    setCurrentPage('home');
  };

  // Location Locking Settings: DISABLED BY DEFAULT
  const [locationLockSettings, setLocationLockSettings] = useState<LocationLockSettings>(() => {
    try {
      const raw = localStorage.getItem('sheltered_backend_lock_settings_v4');
      if (raw) return { ...DEFAULT_LOCK_SETTINGS, ...JSON.parse(raw) };
    } catch {
      // fallback
    }
    return DEFAULT_LOCK_SETTINGS;
  });

  useEffect(() => {
    if (!isAdmin) return;
    backendApi.getAdminSettings(true).then((result) => {
      if (result.success && result.settings) setLocationLockSettings(result.settings);
    });
  }, [isAdmin]);

  const updateLocationLockSettings = async (
    settings: Partial<LocationLockSettings>
  ): Promise<boolean> => {
    const res = await backendApi.updateAdminSettings(isAdmin, settings);
    if (res.success && res.settings) {
      setLocationLockSettings(res.settings);
      showNotification('Location lock & payment settings updated successfully.', 'success');
      return true;
    }
    showNotification(res.error || 'Failed to update settings', 'error');
    return false;
  };

  // Unlocked Locations Mapping (persisted)
  const [unlockedLocations, setUnlockedLocations] = useState<Record<string, UnlockedLocationData>>(() => {
    try {
      const raw = localStorage.getItem('sheltered_backend_unlocked_locations_v4');
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {
      'user-demo-1:prop-mbale-1': {
        propertyId: 'prop-mbale-1',
        streetAddress: 'Plot 14-16, Wanale Road, Senior Quarters',
        locationDetails: 'Senior Quarters, Northern City Division, Mbale City, Uganda',
        coordinates: { lat: 1.0833, lng: 34.1750 },
        directionsUrl: 'https://maps.google.com/?q=1.0833,34.1750',
        unlockedAt: '2026-10-24T14:21:00Z'
      }
    };
  });

  // Check if a property's exact location is currently locked for the active user
  const isPropertyLocationLocked = (propertyId: string): boolean => {
    if (isAdmin) return false; // Admin always sees full coordinates & address
    const prop = properties.find((p) => p.id === propertyId);
    if (!prop) return false;

    // Disabled by default
    const isLockedByPolicy =
      locationLockSettings.enabledGlobally ||
      locationLockSettings.lockedPropertyIds.includes(propertyId) ||
      locationLockSettings.lockedRegions.includes(prop.region) ||
      locationLockSettings.lockedRegions.includes(prop.district);

    if (!isLockedByPolicy) return false;

    // Check if user has unlocked it
    const key = `${currentUser.id}:${propertyId}`;
    return !unlockedLocations[key];
  };

  const refreshLocationData = async (propertyId: string) => {
    const res = await backendApi.getPropertyLocation(propertyId, currentUser.id, isAdmin);
    if (res.exactLocation) {
      setUnlockedLocations((prev) => {
        const neu = { ...prev, [`${currentUser.id}:${propertyId}`]: res.exactLocation! };
        try {
          localStorage.setItem('sheltered_backend_unlocked_locations_v4', JSON.stringify(neu));
        } catch {
          // ignore
        }
        return neu;
      });
    }
  };

  // Location Unlock Modal
  const [unlockModalProperty, setUnlockModalProperty] = useState<Property | null>(null);

  const openLocationUnlock = (property: Property) => {
    setUnlockModalProperty(property);
  };

  const closeLocationUnlock = () => {
    setUnlockModalProperty(null);
  };

  // Security & Audit Logs
  const [transactionalEmails, setTransactionalEmails] = useState<TransactionalEmail[]>(() => {
    return getStoredEmails();
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_audit_logs_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'audit-1',
        timestamp: '2026-10-15T09:00:00Z',
        adminName: 'Chief Administrator (Mbale HQ)',
        adminEmail: 'admin@sheltered.co.ug',
        action: 'Property Approved',
        targetType: 'Property',
        targetId: 'prop-mbale-1',
        details: 'Approved Senior Quarters residential villa following physical white-page title check.'
      }
    ];
  });

  const addAuditLog = (
    action: string,
    details: string,
    targetType: AuditLog['targetType'],
    targetId?: string
  ) => {
    const entry: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      adminName: currentUser.name || 'Staff Administrator',
      adminEmail: currentUser.email || 'admin@sheltered.co.ug',
      action,
      targetType,
      targetId,
      details
    };
    setAuditLogs((prev) => {
      const neu = [entry, ...prev];
      try {
        localStorage.setItem('sheltered_audit_logs_v3', JSON.stringify(neu));
      } catch {
        // ignore
      }
      return neu;
    });
  };

  // Payment Transactions
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_payments_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'tx-init-1',
        reference: 'SHL-99214012-TX',
        purpose: 'featured_promotion',
        title: 'Featured Property Homepage Boost (Senior Quarters Villa)',
        amount: 110000,
        currency: 'UGX',
        method: 'MTN_MOMO',
        phoneNumber: '+256 701 884 902',
        payerName: 'Wamanga Godfrey',
        payerEmail: 'godfrey@elgoncrest.ug',
        propertyId: 'prop-mbale-1',
        status: 'Completed',
        createdAt: '2026-10-12T10:00:00Z',
        gatewayTxId: 'GW-MOMO-882194',
        receiptNumber: 'RCP-884210'
      }
    ];
  });

  const addPaymentTransaction = (tx: PaymentTransaction) => {
    setPaymentTransactions((prev) => {
      const neu = [tx, ...prev];
      try {
        localStorage.setItem('sheltered_payments_v3', JSON.stringify(neu));
      } catch {
        // ignore
      }
      return neu;
    });
    addAuditLog('Payment Processed', `Payment received: ${tx.reference} for ${tx.title} (${tx.amount} ${tx.currency})`, 'Payment', tx.id);
  };

  // Payment Checkout Modal State
  const [checkoutModalState, setCheckoutModalState] = useState<{
    isOpen: boolean;
    purpose: 'listing_fee' | 'featured_promotion' | 'agent_subscription' | 'verification_inspection';
    title: string;
    amount: number;
    propertyId?: string;
  }>({
    isOpen: false,
    purpose: 'listing_fee',
    title: 'Standard Marketplace Listing Fee',
    amount: 55000,
    propertyId: undefined
  });

  const openCheckout = (data: {
    purpose: 'listing_fee' | 'featured_promotion' | 'agent_subscription' | 'verification_inspection';
    title: string;
    amount: number;
    propertyId?: string;
  }) => {
    setCheckoutModalState({
      isOpen: true,
      ...data
    });
  };

  const closeCheckout = () => {
    setCheckoutModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Search Filters
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    if (!isAuthenticated || (currentUser.role !== 'buyer' && currentUser.role !== 'tenant')) return;
    setFilters((prev) => ({
      ...prev,
      country: currentUser.country || '',
      region: currentUser.region || '',
      district: currentUser.district || '',
      neighborhood: currentUser.neighborhood || ''
    }));
  }, [isAuthenticated, currentUser.id, currentUser.role, currentUser.country, currentUser.region, currentUser.district, currentUser.neighborhood]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [scheduleModalProperty, setScheduleModalProperty] = useState<Property | null>(null);
  const [contactModalProperty, setContactModalProperty] = useState<Property | null>(null);
  const [reportModalProperty, setReportModalProperty] = useState<Property | null>(null);
  const [galleryModalData, setGalleryModalData] = useState<{ images: string[]; initialIndex: number } | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const openPropertyDetail = (id: string) => {
    const newRoute: NavigationRoute = {
      page: 'property-detail',
      propertyId: id,
      areaFilter: null
    };

    setSelectedPropertyIdState(id);
    setCurrentPageState('property-detail');
    incrementViews(id);
    saveActiveRoute(newRoute);

    const targetHash = buildRouteHash('property-detail', id);
    if (window.location.hash !== targetHash) {
      window.history.pushState(newRoute, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const incrementViews = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, viewsCount: p.viewsCount + 1 } : p))
    );
  };

  const toggleSaveProperty = (id: string) => {
    setSavedPropertyIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showNotification('Property removed from saved homes', 'info');
        return prev.filter((item) => item !== id);
      } else {
        showNotification('Property saved to your wishlist!', 'success');
        return [...prev, id];
      }
    });

    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              savesCount: savedPropertyIds.includes(id)
                ? Math.max(0, p.savesCount - 1)
                : p.savesCount + 1
            }
          : p
      )
    );
  };

  const isSaved = (id: string) => savedPropertyIds.includes(id);

  const toggleCompareProperty = (id: string) => {
    setComparedPropertyIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) {
        showNotification('You can compare up to 4 properties at once', 'info');
        return prev;
      }
      showNotification('Property added to comparison list', 'success');
      return [...prev, id];
    });
  };

  const clearComparison = () => setComparedPropertyIds([]);
  const isCompared = (id: string) => comparedPropertyIds.includes(id);

  const addProperty = (
    newProp: Omit<Property, 'id' | 'viewsCount' | 'savesCount' | 'dateAdded'>
  ) => {
    const created: Property = {
      ...newProp,
      id: 'prop-' + Date.now(),
      viewsCount: 1,
      savesCount: 0,
      dateAdded: new Date().toISOString()
    };
    setProperties((prev) => [created, ...prev]);
    addAuditLog('Property Submitted', `New listing submitted: "${created.title}" in ${created.district}, ${created.country}`, 'Property', created.id);
  };

  const updatePropertyStatus = (id: string, status: PropertyStatus) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    addAuditLog('Property Status Updated', `Status changed to ${status}`, 'Property', id);
    showNotification(`Property status updated to "${status}"`, 'info');
  };

  const toggleVerifiedStatus = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verified: !p.verified } : p))
    );
    addAuditLog('Property Verification Toggled', `Verification badge updated`, 'Property', id);
    showNotification('Property verification status updated', 'success');
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('Property Deleted', `Listing permanently removed`, 'Property', id);
    showNotification('Property removed successfully', 'info');
  };

  const approveProperty = (id: string, notes?: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Available',
              verified: true,
              approvalDate: new Date().toISOString(),
              approvedBy: currentUser.name || 'Mbale HQ Administrator',
              moderationNotes: notes || 'Verified title & inspected 5 photos + 1 video.'
            }
          : p
      )
    );
    addAuditLog('Property Approved', `Listing approved for public global search. Notes: ${notes || 'Verified standard'}`, 'Property', id);
    showNotification('Property approved and published to the global marketplace!', 'success');
  };

  const rejectProperty = (id: string, reason?: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Unavailable',
              moderationNotes: reason || 'Incomplete 5-photo standard or unverifiable title.'
            }
          : p
      )
    );
    addAuditLog('Property Rejected', `Listing rejected. Reason: ${reason || 'Incomplete requirements'}`, 'Property', id);
    showNotification('Property listing marked as rejected', 'info');
  };

  const addViewingRequest = (
    requestData: Omit<ViewingRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    const newReq: ViewingRequest = {
      ...requestData,
      id: 'viewing-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Pending'
    };
    setViewingRequests((prev) => [newReq, ...prev]);
    showNotification('Viewing request sent to agent! You will receive confirmation shortly.', 'success');
  };

  const updateViewingStatus = (id: string, status: ViewingRequest['status']) => {
    setViewingRequests((prev) =>
      prev.map((vr) => (vr.id === id ? { ...vr, status } : vr))
    );
    showNotification(`Viewing appointment ${status.toLowerCase()}`, 'info');
  };

  const addEnquiry = (enquiryData: Omit<EnquiryMessage, 'id' | 'createdAt' | 'status'>) => {
    const newEnquiry: EnquiryMessage = {
      ...enquiryData,
      id: 'enquiry-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Unread'
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);
    showNotification('Your message has been dispatched to the listing agent.', 'success');
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const applyQuickSearch = (params: {
    listingType?: ListingType;
    country?: string;
    region?: string;
    district?: string;
    neighborhood?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number | 'Any';
  }) => {
    setFilters((prev) => ({
      ...prev,
      listingType: params.listingType || prev.listingType,
      country: params.country !== undefined ? params.country : prev.country,
      region: params.region !== undefined ? params.region : prev.region,
      district: params.district !== undefined ? params.district : prev.district,
      neighborhood: params.neighborhood !== undefined ? params.neighborhood : prev.neighborhood,
      propertyType: params.propertyType !== undefined ? params.propertyType : prev.propertyType,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      bedrooms: params.bedrooms !== undefined ? params.bedrooms : prev.bedrooms
    }));
    setCurrentPage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Only Available and Pending properties for public browsing
  // Sold, Rented, Leased, Unavailable are filtered out of public search
  const availableProperties = properties.filter(
    (p) => p.status === 'Available' || p.status === 'Pending'
  );

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedPropertyId,
        openPropertyDetail,
        selectedAreaFilter,
        setSelectedAreaFilter,
        activeRouteToken,
        setActiveRouteToken,
        locationLockSettings,
        updateLocationLockSettings,
        isPropertyLocationLocked,
        unlockedLocations,
        unlockModalProperty,
        openLocationUnlock,
        closeLocationUnlock,
        refreshLocationData,
        userLanguage,
        setUserLanguage,
        isRtl,
        t,
        userCurrency,
        setUserCurrency,
        companySettings,
        updateCompanySettings,
        locations,
        importLocationsCsv,
        properties,
        availableProperties,
        addProperty,
        updatePropertyStatus,
        toggleVerifiedStatus,
        deleteProperty,
        approveProperty,
        rejectProperty,
        incrementViews,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        logout,
        isAdmin,
        otpModalOpen,
        setOtpModalOpen,
        transactionalEmails,
        auditLogs,
        addAuditLog,
        paymentTransactions,
        addPaymentTransaction,
        checkoutModalState,
        openCheckout,
        closeCheckout,
        savedPropertyIds,
        toggleSaveProperty,
        isSaved,
        comparedPropertyIds,
        toggleCompareProperty,
        clearComparison,
        isCompared,
        viewingRequests,
        addViewingRequest,
        updateViewingStatus,
        enquiries,
        addEnquiry,
        filters,
        setFilters,
        resetFilters,
        applyQuickSearch,
        authModalOpen,
        setAuthModalOpen,
        scheduleModalProperty,
        setScheduleModalProperty,
        contactModalProperty,
        setContactModalProperty,
        reportModalProperty,
        setReportModalProperty,
        galleryModalData,
        setGalleryModalData,
        compareModalOpen,
        setCompareModalOpen,
        showNotification
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold border backdrop-blur-md transition-all animate-bounce bg-neutral-900/95 text-white border-neutral-700">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === 'error'
                ? 'bg-rose-500'
                : toast.type === 'info'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
          {toast.msg}
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
