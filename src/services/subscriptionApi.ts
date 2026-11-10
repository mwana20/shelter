import { API_BASE_URL, getAccessToken } from './authApi';

export interface SubscriptionDiscount {
  minMonths: number;
  maxMonths: number;
  discountPercent: number | string;
}

export interface SubscriptionPlanCatalog {
  free: {
    name: string;
    validityDays: number;
    listingLimit: number;
    mapUnlockLimit: number;
    price: number;
  };
  paid: {
    name: string;
    minimumMonths: number;
    maximumMonths: number;
    currency: string;
    baseMonthlyPrice: number | string;
    listingLimit: number;
    mapUnlockLimit: number;
    discounts: SubscriptionDiscount[];
  };
}

export interface SubscriptionQuote {
  durationMonths: number;
  durationDisplay: string;
  currency: string;
  baseMonthlyPrice: number | string;
  originalTotal: number | string;
  discountPercent: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  savings: number | string;
  effectiveMonthlyCost: number | string;
}

export interface SubscriptionPaymentRecord {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  gatewayReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface SubscriptionRecord {
  id: string;
  plan: 'FREE' | 'PAID';
  status: string;
  durationMonths: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  totalAmount: number | string;
  currency: string;
  payments: SubscriptionPaymentRecord[];
  _count?: { mapUnlocks: number };
}

export interface UserSubscriptionSummary {
  current: SubscriptionRecord | null;
  history: SubscriptionRecord[];
  privileges: {
    plan: string | null;
    expiresAt?: string;
    listingLimit: number;
    listingsUsed: number;
    mapUnlockLimit: number;
    mapUnlocksUsed: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function subscriptionRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; authenticated?: boolean } = {}
): Promise<T> {
  const token = options.authenticated === false ? null : getAccessToken();
  const response = await fetch(`${API_BASE_URL}/subscriptions${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' })
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) })
  });
  const result = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !result?.success || result.data === undefined) {
    throw new Error(result?.message || 'Subscription request failed.');
  }
  return result.data;
}

export function getSubscriptionPlans(): Promise<SubscriptionPlanCatalog> {
  return subscriptionRequest('/plans', { authenticated: false });
}

export function getSubscriptionQuote(months: number): Promise<SubscriptionQuote> {
  return subscriptionRequest(`/quote?months=${months}`, { authenticated: false });
}

export function getMySubscription(): Promise<UserSubscriptionSummary> {
  return subscriptionRequest('/me');
}

export function selectSubscriptionPlan(
  plan: 'FREE' | 'PAID',
  durationMonths?: number
): Promise<{
  subscription: SubscriptionRecord;
  alreadyActive?: boolean;
  checkoutUrl?: string;
  quote?: SubscriptionQuote;
}> {
  return subscriptionRequest('/select', {
    method: 'POST',
    body: { plan, ...(durationMonths === undefined ? {} : { durationMonths }) }
  });
}

export function unlockSubscriptionMap(propertyId: string): Promise<{ unlocked: boolean; alreadyUnlocked: boolean }> {
  return subscriptionRequest('/map-unlocks', {
    method: 'POST',
    body: { propertyId }
  });
}
