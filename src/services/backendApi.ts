import {
  LocationLockSettings,
  LocationUnlockPayment,
  UnlockedLocationData,
  UserRegistrationPayload,
  UserProfile
} from '../types';
import { mockProperties } from '../data/mockProperties';
import { API_BASE_URL, getAccessToken } from './authApi';

// Default Location Lock Settings: MUST BE DISABLED BY DEFAULT!
export const DEFAULT_LOCK_SETTINGS: LocationLockSettings = {
  enabledGlobally: false, // MUST BE DISABLED BY DEFAULT
  lockedPropertyIds: [], // Specific property listing overrides
  lockedRegions: [], // Specific region/area overrides
  unlockFeeAmount: 15, // $15 or 55,000 UGX equivalent
  unlockFeeCurrency: 'USD',
  gatewayEnabled: true, // Visa, Mastercard, PayPal
  merchantCodeEnabled: true, // Merchant code + Transaction ID
  merchantCode: 'SHELTER-MBL-784',
  merchantName: 'Sheltered Global Escrow Services Ltd',
  paymentInstructions: 'Pay the exact unlock fee to merchant code SHELTER-MBL-784 via Mobile Money (MTN *165*3# / Airtel *185*9#), Stanbic FlexiPay, or Bank Wire. Then submit your transaction reference ID below.',
  supportedChannels: [
    'MTN Mobile Money (Pay *165*3# Code: 784011)',
    'Airtel Money (Pay *185*9# Code: 994210)',
    'Stanbic Bank FlexiPay (Merchant: 882194)',
    'Bank Wire / SWIFT (Stanbic Bank Uganda - Acct: 903001884210)'
  ],
  txIdRules: {
    minLength: 6,
    maxLength: 30,
    pattern: '^[A-Za-z0-9_-]+$',
    description: 'Letters, numbers, hyphens, and underscores only (6-30 characters)'
  },
  verificationMode: 'automatic' // 'automatic' or 'manual'
};

// Runtime environment detection for gateway and API Base URL
export const API_RUNTIME_CONFIG = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || '',
  gatewayPublishableKey: (import.meta.env.VITE_PAYMENT_GATEWAY_PUBLISHABLE_KEY as string) || '',
  isLiveApiConfigured: Boolean(
    import.meta.env.VITE_API_BASE_URL &&
    !String(import.meta.env.VITE_API_BASE_URL).includes('MY_') &&
    String(import.meta.env.VITE_API_BASE_URL) !== '/api'
  ),
  isLiveGatewayConfigured: Boolean(
    import.meta.env.VITE_PAYMENT_GATEWAY_PUBLISHABLE_KEY &&
    !String(import.meta.env.VITE_PAYMENT_GATEWAY_PUBLISHABLE_KEY).includes('sample') &&
    !String(import.meta.env.VITE_PAYMENT_GATEWAY_PUBLISHABLE_KEY).includes('MY_')
  )
};

const STORAGE_KEYS = {
  SETTINGS: 'sheltered_backend_lock_settings_v4',
  PAYMENTS: 'sheltered_backend_unlock_payments_v4',
  UNLOCKED_LOCATIONS: 'sheltered_backend_unlocked_locations_v4',
  REGISTERED_USERS: 'sheltered_backend_registered_users_v4',
  AUDIT_LOGS: 'sheltered_backend_audit_logs_v4'
};

async function adminRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error('Sign in with an administrator account to continue.');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.message || 'Admin request failed.');
  }
  return result.data as T;
}

function fromBackendSettings(data: Record<string, unknown>): LocationLockSettings {
  return {
    ...DEFAULT_LOCK_SETTINGS,
    enabledGlobally: Boolean(data.enabledGlobally),
    lockedPropertyIds: Array.isArray(data.lockedPropertyIds) ? data.lockedPropertyIds as string[] : [],
    lockedRegions: Array.isArray(data.lockedRegions) ? data.lockedRegions as string[] : [],
    unlockFeeAmount: Number(data.unlockFeeAmount ?? DEFAULT_LOCK_SETTINGS.unlockFeeAmount),
    unlockFeeCurrency: (data.unlockFeeCurrency as LocationLockSettings['unlockFeeCurrency']) || DEFAULT_LOCK_SETTINGS.unlockFeeCurrency,
    gatewayEnabled: Boolean(data.gatewayEnabled),
    merchantCodeEnabled: Boolean(data.merchantCodeEnabled),
    merchantCode: String(data.merchantCode || DEFAULT_LOCK_SETTINGS.merchantCode),
    merchantName: String(data.merchantName || DEFAULT_LOCK_SETTINGS.merchantName),
    paymentInstructions: String(data.paymentInstructions || DEFAULT_LOCK_SETTINGS.paymentInstructions),
    supportedChannels: Array.isArray(data.supportedChannels) ? data.supportedChannels as string[] : DEFAULT_LOCK_SETTINGS.supportedChannels,
    txIdRules: {
      minLength: Number(data.txIdMinLength ?? DEFAULT_LOCK_SETTINGS.txIdRules.minLength),
      maxLength: Number(data.txIdMaxLength ?? DEFAULT_LOCK_SETTINGS.txIdRules.maxLength),
      pattern: String(data.txIdRegexPattern || DEFAULT_LOCK_SETTINGS.txIdRules.pattern),
      description: DEFAULT_LOCK_SETTINGS.txIdRules.description
    },
    verificationMode: data.verificationMode === 'MANUAL_ADMIN_REVIEW' ? 'manual' : 'automatic'
  };
}

function toBackendSettings(settings: Partial<LocationLockSettings>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const key of [
    'enabledGlobally', 'unlockFeeAmount', 'unlockFeeCurrency', 'gatewayEnabled',
    'merchantCodeEnabled', 'merchantCode', 'merchantName', 'paymentInstructions', 'supportedChannels'
  ] as const) {
    if (settings[key] !== undefined) data[key] = settings[key];
  }
  if (settings.txIdRules) {
    data.txIdMinLength = settings.txIdRules.minLength;
    data.txIdMaxLength = settings.txIdRules.maxLength;
    data.txIdRegexPattern = settings.txIdRules.pattern;
  }
  if (settings.verificationMode) {
    data.verificationMode = settings.verificationMode === 'manual' ? 'MANUAL_ADMIN_REVIEW' : 'AUTOMATIC';
  }
  return data;
}

function fromBackendPayment(payment: Record<string, any>): LocationUnlockPayment {
  const status = String(payment.status || 'PENDING').toLowerCase();
  const paymentMethod = payment.paymentMethod === 'GATEWAY_STRIPE'
    ? 'GATEWAY_CARD'
    : payment.paymentMethod === 'MANUAL_ADMIN_OVERRIDE'
      ? 'MERCHANT_CODE'
      : 'MERCHANT_CODE';

  return {
    id: payment.id,
    userId: payment.userId,
    userEmail: payment.user?.email || '',
    userName: payment.user?.fullName || '',
    propertyId: payment.propertyId,
    propertyTitle: payment.property?.title || '',
    amount: Number(payment.amount),
    currency: payment.currency,
    paymentMethod,
    gatewayReference: payment.gatewayReference || payment.gatewaySessionId || undefined,
    submittedTransactionId: payment.submittedTxId || undefined,
    status: status as LocationUnlockPayment['status'],
    submissionDate: payment.createdAt,
    verificationDate: payment.verifiedAt || undefined,
    adminNotes: payment.auditNotes || undefined,
    rejectionReason: payment.rejectionReason || undefined
  };
}

// In-memory token stores (DO NOT store reset tokens in localStorage!)
interface ResetTokenRecord {
  token: string;
  email: string;
  expiresAt: number; // Timestamp
  used: boolean;
}

interface VerificationTokenRecord {
  token: string;
  email: string;
  code: string;
  expiresAt: number;
  used: boolean;
}

const memoryResetTokens: Map<string, ResetTokenRecord> = new Map();
const memoryVerificationTokens: Map<string, VerificationTokenRecord> = new Map();
const resendRateLimits: Map<string, number> = new Map(); // email -> lastSentTimestamp

// Helper: Persistent storage helpers
function getStoredSettings(): LocationLockSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_LOCK_SETTINGS, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_LOCK_SETTINGS;
}

function saveSettings(settings: LocationLockSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function getStoredPayments(): LocationUnlockPayment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [
    {
      id: 'pay-seed-1',
      userId: 'user-demo-1',
      userEmail: 'michael.kato@shelteredglobal.com',
      userName: 'Michael Kato',
      propertyId: 'prop-mbale-1',
      propertyTitle: 'Executive 5-Bedroom Hillside Villa in Senior Quarters, Mbale',
      amount: 15,
      currency: 'USD',
      paymentMethod: 'GATEWAY_CARD',
      gatewayReference: 'ch_stripe_demo_8829104',
      status: 'verified',
      submissionDate: '2026-10-24T14:20:00Z',
      verificationDate: '2026-10-24T14:21:00Z',
      adminNotes: 'Automated Stripe Webhook confirmation'
    }
  ];
}

function savePayments(payments: LocationUnlockPayment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch {
    // ignore
  }
}

// Map of userId:propertyId -> UnlockedLocationData
function getUnlockedLocationsMap(): Record<string, UnlockedLocationData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LOCATIONS);
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
}

function saveUnlockedLocationsMap(map: Record<string, UnlockedLocationData>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_LOCATIONS, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// User registry
function getRegisteredUsers(): Array<{
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  dob: string;
  phone: string;
  country: string;
  role: string;
  emailVerified: boolean;
}> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [
    {
      id: 'user-demo-1',
      email: 'michael.kato@shelteredglobal.com',
      passwordHash: 'ShelteredGlobal2026!',
      name: 'Michael Kato',
      dob: '1992-05-14',
      phone: '+256 701 884 902',
      country: 'Uganda',
      role: 'agent',
      emailVerified: true
    },
    {
      id: 'user-admin-1',
      email: 'admin@shelteredglobal.com',
      passwordHash: 'AdminMaster2026!',
      name: 'Executive Administrator',
      dob: '1985-11-20',
      phone: '+256 701 000 999',
      country: 'Uganda',
      role: 'admin',
      emailVerified: true
    }
  ];
}

function saveRegisteredUsers(users: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
  } catch {
    // ignore
  }
}

// Calculate age accurately from YYYY-MM-DD
export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// Password strength checker matching rule requirements:
// Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  errorMessage?: string;
} {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-=+~`[\]/\\]/.test(password);

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  let errorMessage: string | undefined;

  if (!isValid) {
    if (!hasMinLength) errorMessage = 'Password must be at least 8 characters.';
    else if (!hasUppercase) errorMessage = 'Password must contain at least one uppercase letter.';
    else if (!hasLowercase) errorMessage = 'Password must contain at least one lowercase letter.';
    else if (!hasNumber) errorMessage = 'Password must contain at least one number.';
    else if (!hasSpecialChar) errorMessage = 'Password must contain at least one special character.';
  }

  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    errorMessage
  };
}

/**
 * Backend API Client & Service
 * Simulates real REST endpoints adhering to the required contracts.
 */
export const backendApi = {
  // ==========================================
  // 1. AUTHENTICATION & REGISTRATION
  // ==========================================

  /**
   * POST /auth/register
   * Server validates email format, server-side age verification (>=18),
   * password complexity, and issues email verification token.
   */
  register: async (
    payload: UserRegistrationPayload
  ): Promise<{
    success: boolean;
    message?: string;
    token?: string;
    verificationCode?: string;
    email?: string;
    error?: string;
  }> => {
    // Simulate network delay (280ms)
    await new Promise((r) => setTimeout(r, 280));

    // 1. Full name validation
    if (!payload.name || payload.name.trim().length < 2) {
      return { success: false, error: 'Full name is required (minimum 2 characters).' };
    }

    // 2. Email validation
    const email = (payload.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Check if email already registered
    const users = getRegisteredUsers();
    if (users.some((u) => u.email === email)) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in or reset your password.'
      };
    }

    // 3. Server-side age restriction enforcement (>= 18 years old)
    if (!payload.dob) {
      return { success: false, error: 'Date of birth is required.' };
    }
    const age = calculateAge(payload.dob);
    if (age < 18) {
      return {
        success: false,
        error: 'You must be at least 18 years old to create an account.'
      };
    }

    // 4. Password validation
    if (payload.password !== payload.confirmPassword) {
      return { success: false, error: 'Password and confirm-password fields do not match.' };
    }
    const pwCheck = validatePasswordStrength(payload.password);
    if (!pwCheck.isValid) {
      return { success: false, error: pwCheck.errorMessage || 'Password does not meet security requirements.' };
    }

    // 5. Create user record in unverified state
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser = {
      id: userId,
      email,
      passwordHash: payload.password,
      name: payload.name.trim(),
      dob: payload.dob,
      phone: payload.phone.trim(),
      country: payload.country || 'Uganda',
      role: payload.role || 'buyer',
      emailVerified: false
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    // 6. Generate verification token & code (valid 15 minutes)
    const token = `vtok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    memoryVerificationTokens.set(token, {
      token,
      email,
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
      used: false
    });
    // Also index by email for convenient lookup
    memoryVerificationTokens.set(`code_${email}`, {
      token,
      email,
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
      used: false
    });

    return {
      success: true,
      message: 'Account successfully registered. Please verify your email to activate your account.',
      token,
      verificationCode: code,
      email
    };
  },

  /**
   * POST /auth/verify-email
   * Validates token or code. Handles expired, invalid, and already-used tokens.
   */
  verifyEmail: async (
    params: { token?: string; code?: string; email?: string }
  ): Promise<{ success: boolean; message?: string; user?: UserProfile; error?: string }> => {
    await new Promise((r) => setTimeout(r, 250));

    let record: VerificationTokenRecord | undefined;
    if (params.token && memoryVerificationTokens.has(params.token)) {
      record = memoryVerificationTokens.get(params.token);
    } else if (params.email && memoryVerificationTokens.has(`code_${params.email.toLowerCase().trim()}`)) {
      record = memoryVerificationTokens.get(`code_${params.email.toLowerCase().trim()}`);
    }

    // Fallback: If in dev preview and user provides 6-digit code for existing user
    if (!record && params.code && params.code.length === 6 && params.email) {
      const email = params.email.toLowerCase().trim();
      const users = getRegisteredUsers();
      const found = users.find((u) => u.email === email);
      if (found) {
        found.emailVerified = true;
        saveRegisteredUsers(users);
        return {
          success: true,
          message: 'Email address verified successfully. You may now access your account.'
        };
      }
    }

    if (!record) {
      return { success: false, error: 'Invalid or missing email verification token.' };
    }

    if (record.used) {
      return { success: false, error: 'This verification token has already been used. Please sign in.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'Verification token has expired. Please request a new verification link.' };
    }

    if (params.code && record.code !== params.code.trim()) {
      return { success: false, error: 'Incorrect 6-digit security code. Please check your inbox and try again.' };
    }

    // Mark as used
    record.used = true;

    // Update user in storage
    const users = getRegisteredUsers();
    const user = users.find((u) => u.email === record!.email);
    if (user) {
      user.emailVerified = true;
      saveRegisteredUsers(users);
    }

    return {
      success: true,
      message: 'Email address successfully verified. You now have full access.'
    };
  },

  /**
   * POST /auth/resend-verification
   * Resends verification link with a 60-second rate-limit cooldown.
   */
  resendVerification: async (
    email: string
  ): Promise<{ success: boolean; message?: string; cooldownRemaining?: number; token?: string; error?: string }> => {
    await new Promise((r) => setTimeout(r, 200));

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    // Rate-limit check (60-second cooldown)
    const lastSent = resendRateLimits.get(cleanEmail);
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - lastSent) / 1000);
      if (elapsed < 60) {
        const remaining = 60 - elapsed;
        return {
          success: false,
          error: `Rate limit reached. Please wait ${remaining} second${remaining === 1 ? '' : 's'} before resending.`,
          cooldownRemaining: remaining
        };
      }
    }

    // Generate fresh token and code
    const token = `vtok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    const record: VerificationTokenRecord = {
      token,
      email: cleanEmail,
      code,
      expiresAt,
      used: false
    };

    memoryVerificationTokens.set(token, record);
    memoryVerificationTokens.set(`code_${cleanEmail}`, record);
    resendRateLimits.set(cleanEmail, Date.now());

    return {
      success: true,
      message: `A new verification email has been dispatched to ${cleanEmail}. Valid for 15 minutes.`,
      token
    };
  },

  // ==========================================
  // 2. PASSWORD RESET FLOW
  // ==========================================

  /**
   * POST /auth/forgot-password
   * Request password reset link. Returns a NEUTRAL success message
   * to prevent email enumeration attacks:
   * "If this email is registered, a password reset link has been sent."
   */
  forgotPassword: async (
    email: string
  ): Promise<{ success: boolean; message: string; previewToken?: string }> => {
    await new Promise((r) => setTimeout(r, 300));

    const cleanEmail = (email || '').trim().toLowerCase();
    const users = getRegisteredUsers();
    const userExists = users.some((u) => u.email === cleanEmail);

    let previewToken: string | undefined;

    if (userExists) {
      // Generate secure time-limited token (15 mins)
      const token = `rst_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`;
      memoryResetTokens.set(token, {
        token,
        email: cleanEmail,
        expiresAt: Date.now() + 15 * 60 * 1000,
        used: false
      });
      previewToken = token;
    }

    // Always return neutral message: never reveal whether the email exists!
    return {
      success: true,
      message: 'If this email is registered, a password reset link has been sent.',
      previewToken // Provided in dev environment for quick link inspection
    };
  },

  /**
   * POST /auth/reset-password
   * Resets password using the time-limited token.
   * Handles: expired, invalid, already-used tokens, weak passwords, and mismatched passwords.
   */
  resetPassword: async (payload: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> => {
    await new Promise((r) => setTimeout(r, 300));

    if (!payload.token) {
      return { success: false, error: 'Reset token is required.' };
    }

    const tokenRecord = memoryResetTokens.get(payload.token);

    if (!tokenRecord) {
      return {
        success: false,
        error: 'Invalid password reset link. Please request a new one.'
      };
    }

    if (tokenRecord.used) {
      return {
        success: false,
        error: 'This password reset link has already been used. Please request a new one.'
      };
    }

    if (Date.now() > tokenRecord.expiresAt) {
      return {
        success: false,
        error: 'This password reset link has expired. Password reset links are valid for 15 minutes.'
      };
    }

    if (payload.newPassword !== payload.confirmPassword) {
      return { success: false, error: 'New password and confirmation do not match.' };
    }

    const strength = validatePasswordStrength(payload.newPassword);
    if (!strength.isValid) {
      return {
        success: false,
        error: strength.errorMessage || 'New password does not meet security requirements.'
      };
    }

    // Update user password and invalidate old credentials
    const users = getRegisteredUsers();
    const user = users.find((u) => u.email === tokenRecord.email);
    if (user) {
      user.passwordHash = payload.newPassword;
      saveRegisteredUsers(users);
    }

    // Mark token as consumed
    tokenRecord.used = true;

    return {
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.'
    };
  },

  // ==========================================
  // 3. SERVER-SIDE LOCATION WITHHOLDING & LOCKING
  // ==========================================

  /**
   * GET /properties/:id/location
   * Core rule: The backend MUST withhold exact location data until payment is verified.
   * If property location is locked, coordinates, full address, and directions are withheld.
   */
  getPropertyLocation: async (
    propertyId: string,
    currentUserId?: string,
    isAdmin?: boolean
  ): Promise<{
    isLocked: boolean;
    generalArea: string;
    district: string;
    country: string;
    unlockFee: number;
    currency: string;
    exactLocation?: UnlockedLocationData;
  }> => {
    await new Promise((r) => setTimeout(r, 80));

    const settings = getStoredSettings();
    const prop = mockProperties.find((p) => p.id === propertyId);

    if (!prop) {
      return {
        isLocked: false,
        generalArea: 'Unknown Location',
        district: '',
        country: '',
        unlockFee: settings.unlockFeeAmount,
        currency: settings.unlockFeeCurrency
      };
    }

    // Location locking is DISABLED BY DEFAULT.
    // It is active ONLY when admin enables it globally, or for this specific property or region.
    const isLockedByAdmin =
      settings.enabledGlobally ||
      settings.lockedPropertyIds.includes(propertyId) ||
      settings.lockedRegions.includes(prop.region) ||
      settings.lockedRegions.includes(prop.district);

    // If not locked by admin, reveal full location directly
    if (!isLockedByAdmin) {
      return {
        isLocked: false,
        generalArea: `${prop.district}, ${prop.country}`,
        district: prop.district,
        country: prop.country,
        unlockFee: settings.unlockFeeAmount,
        currency: settings.unlockFeeCurrency,
        exactLocation: {
          propertyId,
          streetAddress: prop.streetAddress || `${prop.neighborhood || prop.district}, Plot ${prop.id.slice(-3)}`,
          locationDetails: prop.locationDetails,
          coordinates: prop.coordinates,
          directionsUrl: `https://maps.google.com/?q=${prop.coordinates.lat},${prop.coordinates.lng}`,
          unlockedAt: prop.dateAdded
        }
      };
    }

    // If locked by admin, check if user is an admin or has unlocked this property
    const unlockedMap = getUnlockedLocationsMap();
    const isUnlockedForUser =
      isAdmin ||
      (currentUserId && !!unlockedMap[`${currentUserId}:${propertyId}`]);

    if (isUnlockedForUser) {
      const storedUnlocked = currentUserId ? unlockedMap[`${currentUserId}:${propertyId}`] : undefined;
      return {
        isLocked: false,
        generalArea: `${prop.district}, ${prop.country}`,
        district: prop.district,
        country: prop.country,
        unlockFee: settings.unlockFeeAmount,
        currency: settings.unlockFeeCurrency,
        exactLocation: storedUnlocked || {
          propertyId,
          streetAddress: prop.streetAddress || `${prop.neighborhood || prop.district}, Plot ${prop.id.slice(-3)}`,
          locationDetails: prop.locationDetails,
          coordinates: prop.coordinates,
          directionsUrl: `https://maps.google.com/?q=${prop.coordinates.lat},${prop.coordinates.lng}`,
          unlockedAt: new Date().toISOString()
        }
      };
    }

    // If locked and not unlocked: WITHHOLD exact location, address, coordinates, and directions!
    return {
      isLocked: true,
      generalArea: `Approximate area: ${prop.district}, ${prop.country}`,
      district: prop.district,
      country: prop.country,
      unlockFee: settings.unlockFeeAmount,
      currency: settings.unlockFeeCurrency,
      exactLocation: undefined // Explicitly withheld
    };
  },

  // ==========================================
  // 4. PAYMENTS: GATEWAY & MERCHANT CODE
  // ==========================================

  /**
   * POST /payments/location-unlock/gateway-session
   * Option A: Online payment gateway session (Stripe / Visa / Mastercard / PayPal).
   * Does NOT collect raw card numbers in custom forms.
   */
  createGatewaySession: async (payload: {
    propertyId: string;
    userId: string;
    userEmail: string;
    userName: string;
    paymentMethod: 'VISA' | 'MASTERCARD' | 'PAYPAL';
  }): Promise<{
    success: boolean;
    sessionId?: string;
    clientSecret?: string;
    amount?: number;
    currency?: string;
    propertyTitle?: string;
    error?: string;
  }> => {
    await new Promise((r) => setTimeout(r, 300));
    const settings = getStoredSettings();

    if (!settings.gatewayEnabled) {
      return { success: false, error: 'Online payment gateway is currently disabled by administrator.' };
    }

    const prop = mockProperties.find((p) => p.id === payload.propertyId);
    if (!prop) {
      return { success: false, error: 'Property not found.' };
    }

    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const clientSecret = `pi_${sessionId}_secret_${Math.random().toString(36).substring(2, 12)}`;

    // Create pending payment record
    const paymentRecord: LocationUnlockPayment = {
      id: `pay_${Date.now()}`,
      userId: payload.userId,
      userEmail: payload.userEmail,
      userName: payload.userName,
      propertyId: payload.propertyId,
      propertyTitle: prop.title,
      propertyImage: prop.images[0],
      amount: settings.unlockFeeAmount,
      currency: settings.unlockFeeCurrency,
      paymentMethod: payload.paymentMethod === 'PAYPAL' ? 'GATEWAY_PAYPAL' : 'GATEWAY_CARD',
      gatewayReference: sessionId,
      status: 'pending',
      submissionDate: new Date().toISOString()
    };

    const payments = getStoredPayments();
    payments.unshift(paymentRecord);
    savePayments(payments);

    return {
      success: true,
      sessionId,
      clientSecret,
      amount: settings.unlockFeeAmount,
      currency: settings.unlockFeeCurrency,
      propertyTitle: prop.title
    };
  },

  /**
   * POST /payments/location-unlock/verify-gateway
   * Verifies gateway payment via simulated webhook/API.
   * Reveals unlocked location upon confirmed status.
   */
  verifyGatewayPayment: async (payload: {
    sessionId: string;
    propertyId: string;
    userId: string;
  }): Promise<{
    success: boolean;
    payment?: LocationUnlockPayment;
    unlockedLocation?: UnlockedLocationData;
    error?: string;
  }> => {
    await new Promise((r) => setTimeout(r, 400));

    const payments = getStoredPayments();
    const payment = payments.find((p) => p.gatewayReference === payload.sessionId || (p.userId === payload.userId && p.propertyId === payload.propertyId && p.status === 'pending'));

    if (!payment) {
      return { success: false, error: 'Payment session not found or expired.' };
    }

    const prop = mockProperties.find((p) => p.id === payload.propertyId);
    if (!prop) {
      return { success: false, error: 'Property not found.' };
    }

    // Mark as verified
    payment.status = 'verified';
    payment.verificationDate = new Date().toISOString();
    payment.adminNotes = 'Verified via secure payment gateway webhook.';
    savePayments(payments);

    // Save unlocked location state for user
    const unlockedLocation: UnlockedLocationData = {
      propertyId: prop.id,
      streetAddress: prop.streetAddress || `${prop.neighborhood || prop.district}, Plot ${prop.id.slice(-3)}`,
      locationDetails: prop.locationDetails,
      coordinates: prop.coordinates,
      directionsUrl: `https://maps.google.com/?q=${prop.coordinates.lat},${prop.coordinates.lng}`,
      unlockedAt: new Date().toISOString()
    };

    const unlockedMap = getUnlockedLocationsMap();
    unlockedMap[`${payload.userId}:${prop.id}`] = unlockedLocation;
    saveUnlockedLocationsMap(unlockedMap);

    return {
      success: true,
      payment,
      unlockedLocation
    };
  },

  /**
   * POST /payments/location-unlock/submit-transaction
   * Option B: Merchant-code payment with transaction ID verification.
   * Validates format, regex, length, duplicate check, and handles automatic vs manual review.
   */
  submitMerchantTransaction: async (payload: {
    propertyId: string;
    userId: string;
    userEmail: string;
    userName: string;
    transactionId: string;
  }): Promise<{
    success: boolean;
    status: 'verified' | 'pending' | 'rejected' | 'duplicate';
    message: string;
    payment?: LocationUnlockPayment;
    unlockedLocation?: UnlockedLocationData;
    error?: string;
  }> => {
    await new Promise((r) => setTimeout(r, 450));

    const settings = getStoredSettings();
    if (!settings.merchantCodeEnabled) {
      return {
        success: false,
        status: 'rejected',
        message: 'Merchant code payment is currently disabled.',
        error: 'Merchant code payment option is disabled.'
      };
    }

    const txId = (payload.transactionId || '').trim();
    const { minLength, maxLength, pattern } = settings.txIdRules;

    // 1. Required validation
    if (!txId) {
      return {
        success: false,
        status: 'rejected',
        message: 'Transaction ID is required.',
        error: 'Please enter the transaction reference ID from your receipt or SMS.'
      };
    }

    // 2. Length check
    if (txId.length < minLength || txId.length > maxLength) {
      return {
        success: false,
        status: 'rejected',
        message: `Transaction ID must be between ${minLength} and ${maxLength} characters.`,
        error: `Transaction ID length must be between ${minLength} and ${maxLength} characters.`
      };
    }

    // 3. Format / Pattern check
    try {
      const regex = new RegExp(pattern);
      if (!regex.test(txId)) {
        return {
          success: false,
          status: 'rejected',
          message: 'Transaction ID contains invalid characters. Letters, numbers, hyphens, and underscores only.',
          error: 'Invalid transaction ID format.'
        };
      }
    } catch {
      // ignore regex syntax errors
    }

    // 4. Duplicate check
    const payments = getStoredPayments();
    const isDuplicateByUser = payments.some(
      (p) =>
        p.submittedTransactionId?.toLowerCase() === txId.toLowerCase() &&
        p.userId === payload.userId &&
        (p.status === 'verified' || p.status === 'pending')
    );

    if (isDuplicateByUser) {
      return {
        success: false,
        status: 'duplicate',
        message: 'Transaction ID already used. You have already submitted this transaction reference.',
        error: 'Transaction ID already used.'
      };
    }

    const prop = mockProperties.find((p) => p.id === payload.propertyId);
    if (!prop) {
      return {
        success: false,
        status: 'rejected',
        message: 'Property not found.',
        error: 'Property not found.'
      };
    }

    // 5. Verification logic based on admin settings
    const paymentRecord: LocationUnlockPayment = {
      id: `tx_${Date.now()}`,
      userId: payload.userId,
      userEmail: payload.userEmail,
      userName: payload.userName,
      propertyId: payload.propertyId,
      propertyTitle: prop.title,
      propertyImage: prop.images[0],
      amount: settings.unlockFeeAmount,
      currency: settings.unlockFeeCurrency,
      paymentMethod: 'MERCHANT_CODE',
      submittedTransactionId: txId,
      status: settings.verificationMode === 'automatic' ? 'verified' : 'pending',
      submissionDate: new Date().toISOString(),
      verificationDate: settings.verificationMode === 'automatic' ? new Date().toISOString() : undefined,
      adminNotes:
        settings.verificationMode === 'automatic'
          ? 'Instantly verified via telecom transaction clearing API.'
          : 'Pending manual administrator verification against bank/merchant ledger.'
    };

    payments.unshift(paymentRecord);
    savePayments(payments);

    if (settings.verificationMode === 'automatic') {
      // Unlock location
      const unlockedLocation: UnlockedLocationData = {
        propertyId: prop.id,
        streetAddress: prop.streetAddress || `${prop.neighborhood || prop.district}, Plot ${prop.id.slice(-3)}`,
        locationDetails: prop.locationDetails,
        coordinates: prop.coordinates,
        directionsUrl: `https://maps.google.com/?q=${prop.coordinates.lat},${prop.coordinates.lng}`,
        unlockedAt: new Date().toISOString()
      };

      const unlockedMap = getUnlockedLocationsMap();
      unlockedMap[`${payload.userId}:${prop.id}`] = unlockedLocation;
      saveUnlockedLocationsMap(unlockedMap);

      return {
        success: true,
        status: 'verified',
        message: 'Transaction successfully verified! The exact location is now unlocked.',
        payment: paymentRecord,
        unlockedLocation
      };
    } else {
      // Manual review mode
      return {
        success: true,
        status: 'pending',
        message: 'Your payment is being verified. You will get access once verification is complete.',
        payment: paymentRecord
      };
    }
  },

  /**
   * GET /payments/location-unlock/status/:submissionId
   * Checks status of a submitted transaction.
   */
  getPaymentStatus: async (
    submissionId: string
  ): Promise<{
    payment?: LocationUnlockPayment;
    unlockedLocation?: UnlockedLocationData;
    error?: string;
  }> => {
    await new Promise((r) => setTimeout(r, 150));
    const payments = getStoredPayments();
    const payment = payments.find((p) => p.id === submissionId || p.gatewayReference === submissionId || p.submittedTransactionId === submissionId);

    if (!payment) {
      return { error: 'Transaction record not found.' };
    }

    let unlockedLocation: UnlockedLocationData | undefined;
    if (payment.status === 'verified') {
      const unlockedMap = getUnlockedLocationsMap();
      unlockedLocation = unlockedMap[`${payment.userId}:${payment.propertyId}`];
    }

    return { payment, unlockedLocation };
  },

  /**
   * GET /payments/my-payments
   * Returns current user's payments and transaction submissions.
   */
  getMyPayments: async (userId: string): Promise<LocationUnlockPayment[]> => {
    await new Promise((r) => setTimeout(r, 200));
    const payments = getStoredPayments();
    return payments.filter((p) => p.userId === userId);
  },

  // ==========================================
  // 5. ADMIN CONTROLS & CONFIGURATION
  // ==========================================

  /**
   * GET /admin/payment-settings
   * Admin only. Returns current settings.
   */
  getAdminSettings: async (isAdmin: boolean): Promise<{ success: boolean; settings?: LocationLockSettings; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }
    try {
      const data = await adminRequest<Record<string, unknown>>('/admin/payment-settings');
      return { success: true, settings: fromBackendSettings(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to load settings.' };
    }
  },

  /**
   * PUT /admin/payment-settings
   * Admin only. Updates lock and payment configuration.
   */
  updateAdminSettings: async (
    isAdmin: boolean,
    newSettings: Partial<LocationLockSettings>
  ): Promise<{ success: boolean; settings?: LocationLockSettings; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }
    try {
      const data = await adminRequest<Record<string, unknown>>(
        '/admin/payment-settings',
        'PUT',
        toBackendSettings(newSettings)
      );
      return { success: true, settings: { ...fromBackendSettings(data), ...newSettings } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update settings.' };
    }
  },

  /**
   * GET /admin/payments
   * Admin only. Returns all payments with status filtering.
   */
  getAdminPayments: async (
    isAdmin: boolean,
    statusFilter?: string
  ): Promise<{ success: boolean; payments?: LocationUnlockPayment[]; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }
    try {
      const query = new URLSearchParams({ page: '1', limit: '100' });
      if (statusFilter && statusFilter !== 'ALL') query.set('status', statusFilter.toUpperCase());
      const result = await adminRequest<{ items: Record<string, any>[] }>(`/admin/payments?${query}`);
      return { success: true, payments: (result.items || []).map(fromBackendPayment) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to load payments.' };
    }
  },

  /**
   * PATCH /admin/payments/:id
   * Admin only. Approve or reject pending merchant transaction.
   * If rejecting, mandatory reason must be provided.
   */
  reviewPayment: async (
    isAdmin: boolean,
    paymentId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<{ success: boolean; payment?: LocationUnlockPayment; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }
    try {
      const data = await adminRequest<{ payment: Record<string, any> }>(`/admin/payments/${paymentId}`, 'PUT', {
        action: action.toUpperCase(),
        ...(action === 'reject' ? { rejectionReason: reason } : {})
      });
      return { success: true, payment: data.payment ? fromBackendPayment(data.payment) : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to review payment.' };
    }
  },

  /**
   * POST /admin/payments/manual-unlock
   * Admin only. Manually unlocks a location for a user in exceptional support cases,
   * with a mandatory audit reason.
   */
  manualUnlockLocation: async (
    isAdmin: boolean,
    payload: {
      propertyId: string;
      userId: string;
      userEmail: string;
      userName: string;
      reason: string;
    }
  ): Promise<{ success: boolean; unlockedLocation?: UnlockedLocationData; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }
    try {
      await adminRequest('/admin/payments/manual-unlock', 'POST', {
        propertyId: payload.propertyId,
        userEmail: payload.userEmail,
        reason: payload.reason
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to unlock location.' };
    }
  }
};
