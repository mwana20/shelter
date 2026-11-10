import { API_BASE_URL, getAccessToken } from './authApi';
import { SubscriptionDiscount, SubscriptionPaymentRecord, SubscriptionRecord } from './subscriptionApi';

export interface AdminSubscriptionConfig {
  id: string;
  baseMonthlyPrice: number | string;
  currency: string;
  freeValidityDays: number;
  freeListingLimit: number;
  freeMapUnlockLimit: number;
  paidListingLimit: number;
  paidMapUnlockLimit: number;
  discounts: Array<SubscriptionDiscount & { id?: string }>;
}

export interface AdminSubscription extends SubscriptionRecord {
  userId: string;
  createdAt: string;
  user: { id: string; email: string; fullName: string; role: string };
  payments: SubscriptionPaymentRecord[];
}

export interface AdminSubscriptionUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  accountStatus: string;
  subscriptions: SubscriptionRecord[];
}

export interface AdminPropertyReview {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number | string;
  currency: string;
  status: string;
  country: string;
  region: string;
  district: string;
  exactAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  reviewNote?: string | null;
  owner: { id: string; fullName: string; email: string; phone?: string | null; role?: string };
  media: Array<{ id: string; publicUrl: string; mimeType: string; kind: string; isActive: boolean }>;
  reviewHistory: Array<{ id: string; action: string; notes?: string | null; fromStatus: string; toStatus: string; createdAt: string }>;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

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
  const result = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !result?.success || result.data === undefined) {
    throw new Error(result?.message || 'Admin request failed.');
  }
  return result.data;
}

export const subscriptionAdminApi = {
  getConfig: () => adminRequest<AdminSubscriptionConfig>('/admin/subscriptions/config'),

  updateConfig: (config: Omit<AdminSubscriptionConfig, 'id' | 'discounts'> & {
    discounts: SubscriptionDiscount[];
  }) => adminRequest<AdminSubscriptionConfig>('/admin/subscriptions/config', 'PUT', config),

  listSubscriptions: async (status = 'ALL') => {
    const query = new URLSearchParams({ page: '1', limit: '100', status });
    const result = await adminRequest<{ items: AdminSubscription[] }>(`/admin/subscriptions?${query}`);
    return result.items || [];
  },

  listUsers: async (search = '') => {
    const query = new URLSearchParams({ page: '1', limit: '100' });
    if (search.trim()) query.set('search', search.trim());
    const result = await adminRequest<{ items: AdminSubscriptionUser[] }>(`/admin/subscriptions/users?${query}`);
    return result.items || [];
  },

  grant: (userId: string, body: { plan: 'FREE' | 'PAID'; durationMonths?: number; reason: string }) =>
    adminRequest<SubscriptionRecord>(`/admin/subscriptions/users/${encodeURIComponent(userId)}/grant`, 'POST', body),

  revoke: (subscriptionId: string, reason: string) =>
    adminRequest<SubscriptionRecord>(`/admin/subscriptions/${encodeURIComponent(subscriptionId)}/revoke`, 'PUT', { reason }),

  listProperties: async (status = 'PENDING_REVIEW'): Promise<{ items: AdminPropertyReview[]; totalItems: number }> => {
    const query = new URLSearchParams({ page: '1', limit: '100', status });
    const result = await adminRequest<{ items: AdminPropertyReview[]; pagination?: { totalItems?: number } }>(`/admin/properties?${query}`);
    return { items: result.items || [], totalItems: result.pagination?.totalItems ?? result.items?.length ?? 0 };
  },

  reviewProperty: (propertyId: string, action: 'approve' | 'reject' | 'corrections', notes?: string) =>
    adminRequest<{ property: AdminPropertyReview }>(
      `/admin/properties/${encodeURIComponent(propertyId)}/${action === 'corrections' ? 'request-corrections' : action}`,
      'PUT',
      notes ? { notes } : {}
    )
};
