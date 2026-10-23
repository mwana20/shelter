import { UserProfile, UserRole } from '../types';

const MOCK_USER_STORAGE_KEY = 'sheltered_mock_current_user';
const MOCK_USERS_DATABASE_KEY = 'sheltered_mock_registered_users';

export const DEFAULT_MOCK_USER: UserProfile = {
  id: 'user-default-1',
  name: 'Kato Michael',
  email: 'kato.michael@shelteredglobal.com',
  phone: '+256 701 889 200',
  role: 'agent',
  sellerType: 'licensed_agent',
  companyName: 'East African Prime Properties Ltd',
  agencyLicense: 'UG-MBL-2024-9182',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  emailVerified: true,
  phoneVerified: true,
  preferredLanguage: 'en',
  preferredCurrency: 'USD',
  verificationStatus: 'Verified',
  bio: 'International property advisor and licensed broker representing premium residences, titled land investments, and commercial spaces across East Africa and international hubs.',
  country: 'Uganda',
  city: 'Mbale City (HQ)',
  termsAccepted: true,
  termsAcceptedAt: '2026-01-15T10:00:00Z',
  termsVersion: '2.0-GLOBAL',
  privacyAcknowledged: true,
};

/**
 * Isolated Mock Authentication Adapter
 * Architecture Note for Backend Engineers:
 * Replace this service implementation with standard JWT/Bearer token requests to your
 * production authentication API (e.g. POST /api/v1/auth/login, POST /api/v1/auth/register).
 */
export interface AuthServiceAdapter {
  isMock: boolean;
  getCurrentUser: () => UserProfile;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    companyName?: string;
    agencyLicense?: string;
    country?: string;
  }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; user: UserProfile }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const mockAuthService: AuthServiceAdapter = {
  isMock: true,

  getCurrentUser: (): UserProfile => {
    try {
      const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_MOCK_USER;
  },

  login: async (email: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    // Simulate network latency (250ms)
    await new Promise((res) => setTimeout(res, 250));

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const currentUser = mockAuthService.getCurrentUser();
    const updatedUser: UserProfile = {
      ...currentUser,
      email: email.trim().toLowerCase(),
      name: email.split('@')[0].replace(/[\._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    };

    try {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch {
      // Ignore storage errors in sandbox
    }

    return { success: true, user: updatedUser };
  },

  register: async (payload): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    await new Promise((res) => setTimeout(res, 300));

    if (!payload.name || !payload.email) {
      return { success: false, error: 'Full name and email are required.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone || '+256 700 000 000',
      role: payload.role,
      companyName: payload.companyName || '',
      agencyLicense: payload.agencyLicense || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      emailVerified: false, // Starts unverified per registration flow
      phoneVerified: false,
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      verificationStatus: payload.role === 'buyer' ? 'Verified' : 'Pending Review',
      country: payload.country || 'Uganda',
      city: 'Mbale City (HQ)',
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
      termsVersion: '2.0-GLOBAL',
      privacyAcknowledged: true,
    };

    try {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Ignore
    }

    return { success: true, user: newUser };
  },

  updateProfile: async (updates): Promise<{ success: boolean; user: UserProfile }> => {
    const current = mockAuthService.getCurrentUser();
    const merged: UserProfile = { ...current, ...updates };
    try {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // Ignore
    }
    return { success: true, user: merged };
  },

  requestPasswordReset: async (email: string) => {
    await new Promise((res) => setTimeout(res, 200));
    return {
      success: true,
      message: `If an account exists for ${email}, a password reset verification link has been dispatched.`
    };
  },

  logout: () => {
    try {
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
};
