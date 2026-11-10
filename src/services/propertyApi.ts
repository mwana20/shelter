import { API_BASE_URL, getAccessToken } from './authApi';
import { PropertyMediaRef } from './mediaApi';

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