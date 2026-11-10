import { API_BASE_URL, getAccessToken } from './authApi';
import { PropertyMediaRef } from './mediaApi';

export interface OwnerPropertyRecord {
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
  viewsCount: number;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
  media: Array<{ id: string; kind: 'IMAGE' | 'VIDEO'; publicUrl: string; thumbnailUrl?: string | null }>;
  reviewHistory: Array<{ id: string; action: string; notes?: string | null; createdAt: string; toStatus: string }>;
}

interface PropertyApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function ownerPropertyRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error('Sign in to manage your submitted properties.');
  const response = await fetch(`${API_BASE_URL}/properties${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const result = await response.json().catch(() => null) as PropertyApiResponse<T> | null;
  if (!response.ok || !result?.success || result.data === undefined) {
    throw new Error(result?.message || 'Property request failed.');
  }
  return result.data;
}

export function getMyBackendProperties(): Promise<OwnerPropertyRecord[]> {
  return ownerPropertyRequest('/mine');
}

export function resubmitBackendProperty(
  propertyId: string,
  changes: { title: string; description: string; price: number }
): Promise<OwnerPropertyRecord> {
  return ownerPropertyRequest(`/${encodeURIComponent(propertyId)}`, 'PUT', changes);
}

export async function createPropertyWithBackend(payload: {
  title: string;
  description: string;
  propertyType: string;
  listingType: 'SALE' | 'RENT' | 'LEASE';
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  landSizeSqFt?: number;
  country: string;
  region: string;
  district: string;
  neighborhood?: string;
  exactAddress?: string;
  latitude?: number;
  longitude?: number;
  propertyId: string;
  mediaBatchId: string;
  mediaRefs: PropertyMediaRef[];
}): Promise<{ success: boolean; property?: any; error?: string }> {
  const token = getAccessToken();
  if (!token) return { success: false, error: 'Sign in before listing a property.' };

  try {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as any;
    if (!response.ok || !result?.success) {
      return { success: false, error: result?.message || 'Failed to create property on backend.' };
    }
    return { success: true, property: result.data };
  } catch {
    return { success: false, error: 'Unable to reach the backend.' };
  }
}