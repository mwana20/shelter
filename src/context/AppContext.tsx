import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Property,
  PropertyStatus,
  ViewingRequest,
  EnquiryMessage,
  UserProfile,
  FilterState,
  ListingType
} from '../types';
import { mockProperties } from '../data/mockProperties';

export interface AppContextType {
  // Navigation & Routing
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedPropertyId: string | null;
  openPropertyDetail: (id: string) => void;
  selectedAreaFilter: string | null;
  setSelectedAreaFilter: (area: string | null) => void;

  // Property Data & Mutation
  properties: Property[];
  availableProperties: Property[]; // excludes Sold, Rented, Unavailable for standard searches
  addProperty: (property: Omit<Property, 'id' | 'viewsCount' | 'savesCount' | 'dateAdded'>) => void;
  updatePropertyStatus: (id: string, status: PropertyStatus) => void;
  toggleVerifiedStatus: (id: string) => void;
  deleteProperty: (id: string) => void;
  approveProperty: (id: string) => void;
  rejectProperty: (id: string) => void;
  incrementViews: (id: string) => void;

  // User & Auth
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;

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
  applyQuickSearch: (params: { listingType?: ListingType; area?: string; propertyType?: string; minPrice?: number; maxPrice?: number; bedrooms?: number | 'Any' }) => void;

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

const defaultFilters: FilterState = {
  listingType: 'All',
  area: '',
  propertyType: '',
  minPrice: undefined,
  maxPrice: undefined,
  bedrooms: 'Any',
  bathrooms: 'Any',
  amenities: [],
  searchQuery: '',
  sortBy: 'recommended'
};

const defaultUser: UserProfile = {
  id: 'user-demo-1',
  name: 'Phillip Mwanaweika',
  email: 'phillipmwanaweika@gmail.com',
  phone: '+256 700 123 456',
  role: 'buyer'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string | null>(null);

  // Property listings state with localStorage cache
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_properties_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return mockProperties;
  });

  // Saved / Favorited properties
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_saved_ids');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['prop-1', 'prop-3'];
  });

  // Compared properties
  const [comparedPropertyIds, setComparedPropertyIds] = useState<string[]>([]);

  // User viewing requests
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_viewings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'viewing-1',
        propertyId: 'prop-1',
        propertyTitle: 'Modern 4-Bedroom Family Home with Servant Quarters',
        propertyPrice: 450000000,
        propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
        listingType: 'Sale',
        date: '2026-10-12',
        timeSlot: '11:00 AM - 12:30 PM',
        userName: 'Phillip Mwanaweika',
        userPhone: '+256 700 123 456',
        userEmail: 'phillipmwanaweika@gmail.com',
        notes: 'Would like to inspect the boundary markers and title search copy.',
        status: 'Confirmed',
        createdAt: '2026-10-06T14:20:00Z'
      }
    ];
  });

  // Enquiries
  const [enquiries, setEnquiries] = useState<EnquiryMessage[]>(() => {
    try {
      const saved = localStorage.getItem('sheltered_enquiries');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'enquiry-1',
        propertyId: 'prop-3',
        propertyTitle: 'Luxury 5-Bedroom Hillside Villa on 25 Decimals',
        userName: 'Phillip Mwanaweika',
        userEmail: 'phillipmwanaweika@gmail.com',
        userPhone: '+256 700 123 456',
        message: 'Is the asking price slightly negotiable if payment is made in cash within 30 days?',
        createdAt: '2026-10-05T09:12:00Z',
        status: 'Replied'
      }
    ];
  });

  // User authentication
  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultUser);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Search Filters
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scheduleModalProperty, setScheduleModalProperty] = useState<Property | null>(null);
  const [contactModalProperty, setContactModalProperty] = useState<Property | null>(null);
  const [reportModalProperty, setReportModalProperty] = useState<Property | null>(null);
  const [galleryModalData, setGalleryModalData] = useState<{ images: string[]; initialIndex: number } | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sheltered_properties_v2', JSON.stringify(properties));
    } catch {
      // ignore
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem('sheltered_saved_ids', JSON.stringify(savedPropertyIds));
    } catch {
      // ignore
    }
  }, [savedPropertyIds]);

  useEffect(() => {
    try {
      localStorage.setItem('sheltered_viewings', JSON.stringify(viewingRequests));
    } catch {
      // ignore
    }
  }, [viewingRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('sheltered_enquiries', JSON.stringify(enquiries));
    } catch {
      // ignore
    }
  }, [enquiries]);

  const showNotification = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const openPropertyDetail = (id: string) => {
    setSelectedPropertyId(id);
    setCurrentPage('property-detail');
    incrementViews(id);
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
  };

  const updatePropertyStatus = (id: string, status: PropertyStatus) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    showNotification(`Property status updated to "${status}"`, 'info');
  };

  const toggleVerifiedStatus = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verified: !p.verified } : p))
    );
    showNotification('Property verification status updated', 'success');
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    showNotification('Property removed successfully', 'info');
  };

  const approveProperty = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Available', verified: true } : p))
    );
    showNotification('Property approved and published to Mukono marketplace!', 'success');
  };

  const rejectProperty = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Unavailable' } : p))
    );
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
    area?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number | 'Any';
  }) => {
    setFilters((prev) => ({
      ...prev,
      listingType: params.listingType || prev.listingType,
      area: params.area !== undefined ? params.area : prev.area,
      propertyType: params.propertyType !== undefined ? params.propertyType : prev.propertyType,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      bedrooms: params.bedrooms !== undefined ? params.bedrooms : prev.bedrooms
    }));
    setCurrentPage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Only Available (and optionally Pending) properties for buyers/renters
  // Sold, Rented, Unavailable are excluded from active search
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
        isAdmin,
        setIsAdmin,
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold border backdrop-blur-md transition-all animate-bounce bg-neutral-900/95 text-white border-neutral-700">
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
