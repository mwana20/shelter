import { UserProfile, UserRole } from '../types';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL =
  !configuredApiBaseUrl || configuredApiBaseUrl === '/api'
    ? 'http://localhost:5000/api/v1'
    : configuredApiBaseUrl.replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'sheltered_access_token';
const REFRESH_TOKEN_KEY = 'sheltered_refresh_token';

type BackendRole = 'BUYER' | 'SELLER' | 'AGENT' | 'ADMIN';

interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  country?: string | null;
  region?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  bio?: string | null;
  role: BackendRole;
  accountStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  emailVerified: boolean;
  phoneVerified: boolean;
  companyName?: string | null;
  agencyLicense?: string | null;
  avatarUrl?: string | null;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: BackendUser;
    accessToken?: string;
    refreshToken?: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface RegistrationResult {
  userId: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  token?: string;
}

async function postAuth<T>(path: string, payload: unknown): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error('Unable to reach the backend. Make sure the API server is running.');
  }

  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !result?.success || result.data === undefined) {
    throw new Error(result?.message || 'The request failed. Please try again.');
  }

  return result;
}

const roleMap: Record<BackendRole, UserRole> = {
  BUYER: 'buyer',
  SELLER: 'owner',
  AGENT: 'agent',
  ADMIN: 'admin'
};

export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) return token;

  const legacyToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (legacyToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, legacyToken);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  return legacyToken;
};

export const clearAuthSession = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};

function mapBackendUser(backendUser: BackendUser): UserProfile {
  return {
    id: backendUser.id,
    name: backendUser.fullName,
    email: backendUser.email,
    phone: backendUser.phone || '',
    dob: backendUser.dateOfBirth || undefined,
    country: backendUser.country || undefined,
    region: backendUser.region || undefined,
    district: backendUser.district || undefined,
    neighborhood: backendUser.neighborhood || undefined,
    bio: backendUser.bio || undefined,
    role: roleMap[backendUser.role],
    accountStatus: backendUser.accountStatus,
    emailVerified: backendUser.emailVerified,
    phoneVerified: backendUser.phoneVerified,
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    companyName: backendUser.companyName || undefined,
    agencyLicense: backendUser.agencyLicense || undefined,
    avatar: backendUser.avatarUrl || undefined,
    termsAccepted: false,
    privacyAcknowledged: false
  };
}

export async function getAuthenticatedUser(): Promise<UserProfile> {
  let token = getAccessToken();
  if (!token) throw new Error('No active session.');

  let response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 401 && localStorage.getItem(REFRESH_TOKEN_KEY)) {
    const refreshed = await postAuth<{ accessToken: string; refreshToken: string }>('refresh', {
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
    });
    token = refreshed.data!.accessToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshed.data!.refreshToken);
    response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: 'Bearer ' + token }
    });
  }
  const result = (await response.json().catch(() => null)) as ApiResponse<BackendUser> | null;
  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || 'Your session has expired. Please sign in again.');
  }

  return mapBackendUser(result.data);
}

export async function signInWithBackend(email: string, password: string): Promise<UserProfile> {
  const result = await postAuth<LoginResponse['data']>('login', { email, password });

  if (!result.data?.user || !result.data.accessToken || !result.data.refreshToken) {
    throw new Error(result?.message || 'Sign-in failed. Check your email and password.');
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refreshToken);
  try {
    return await getAuthenticatedUser();
  } catch (error) {
    clearAuthSession();
    throw error;
  }
}

export async function registerWithBackend(payload: {
  name: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  country?: string;
  region?: string;
  district?: string;
  neighborhood?: string;
  bio?: string;
  companyName?: string;
  agencyLicense?: string;
}): Promise<{ userId: string; email: string; fullName: string; token?: string; message?: string }> {
  const role: BackendRole =
    payload.role === 'agent' || payload.role === 'broker'
      ? 'AGENT'
      : payload.role === 'owner' || payload.role === 'landlord'
        ? 'SELLER'
        : 'BUYER';
  const result = await postAuth<RegistrationResult>('register', {
    fullName: payload.name,
    email: payload.email,
    phone: payload.phone,
    dateOfBirth: payload.dob,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
    role,
    country: payload.country,
    region: payload.region,
    district: payload.district,
    neighborhood: payload.neighborhood,
    bio: payload.bio,
    companyName: payload.companyName,
    agencyLicense: payload.agencyLicense
  });

  return { ...result.data!, message: result.message };
}

export async function updateProfileWithBackend(payload: {
  fullName: string;
  phone: string;
  country?: string;
  region?: string;
  district?: string;
  neighborhood?: string;
  bio?: string;
  companyName?: string;
  agencyLicense?: string;
  avatarUrl?: string;
}): Promise<UserProfile> {
  const token = getAccessToken();
  if (!token) throw new Error('Sign in before updating your profile.');

  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const result = (await response.json().catch(() => null)) as ApiResponse<BackendUser> | null;
  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || 'Profile update failed.');
  }
  return mapBackendUser(result.data);
}

export async function verifyEmailWithBackend(params: {
  token?: string;
  code?: string;
  email?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const result = await postAuth<{ email: string; emailVerified: boolean }>('verify-email', params);
    return { success: true, message: result.message };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email verification failed.'
    };
  }
}

export async function resendVerificationWithBackend(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  cooldownRemaining?: number;
}> {
  try {
    const result = await postAuth<{ message: string }>('resend-verification', { email });
    return { success: true, message: result.data?.message || result.message };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Could not resend verification email.'
    };
  }
}