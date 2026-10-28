import { UserProfile, UserRole } from '../types';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL =
  !configuredApiBaseUrl || configuredApiBaseUrl === '/api'
    ? 'http://localhost:5000/api/v1'
    : configuredApiBaseUrl.replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'sheltered_access_token';

type BackendRole = 'BUYER' | 'SELLER' | 'AGENT' | 'ADMIN';

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: {
      id: string;
      email: string;
      fullName: string;
      role: BackendRole;
      emailVerified: boolean;
      phoneVerified: boolean;
    };
    accessToken?: string;
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

export const getAccessToken = (): string | null => sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const clearAuthSession = (): void => sessionStorage.removeItem(ACCESS_TOKEN_KEY);

function mapBackendUser(backendUser: NonNullable<LoginResponse['data']>['user']): UserProfile {
  if (!backendUser) throw new Error('Backend response did not include a user.');

  return {
    id: backendUser.id,
    name: backendUser.fullName,
    email: backendUser.email,
    phone: '',
    role: roleMap[backendUser.role],
    emailVerified: backendUser.emailVerified,
    phoneVerified: backendUser.phoneVerified,
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    termsAccepted: false,
    privacyAcknowledged: false
  };
}

export async function getAuthenticatedUser(): Promise<UserProfile> {
  const token = getAccessToken();
  if (!token) throw new Error('No active session.');

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const result = (await response.json().catch(() => null)) as ApiResponse<LoginResponse['data'] extends { user: infer U } ? U : never> | null;
  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || 'Your session has expired. Please sign in again.');
  }

  return mapBackendUser(result.data as NonNullable<LoginResponse['data']>['user']);
}

export async function signInWithBackend(email: string, password: string): Promise<UserProfile> {
  const result = await postAuth<LoginResponse['data']>('login', { email, password });

  if (!result.data?.user || !result.data.accessToken) {
    throw new Error(result?.message || 'Sign-in failed. Check your email and password.');
  }

  const backendUser = result.data.user;
  sessionStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
  return mapBackendUser(backendUser);
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
    companyName: payload.companyName,
    agencyLicense: payload.agencyLicense
  });

  return { ...result.data!, message: result.message };
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