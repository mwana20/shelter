import { API_BASE_URL, getAccessToken } from './authApi';
import { PropertyMediaRef } from './mediaApi';
import { ListingType, Property, PropertyType } from '../types';
import { CurrencyCode, SUPPORTED_CURRENCY_CODES } from '../utils/currency';

interface PublicPropertyRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number | string;
  currency: string;
  status: string;
  bedrooms?: number | null;
  bathrooms?: number | string | null;
  landSizeSqFt?: number | string | null;
  featured?: boolean;
  viewsCount?: number;
  country: string;
  region: string;
  district: string;
  neighborhood?: string | null;
  exactAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  directionsGuide?: string | null;
  cadastralPlotNumber?: string | null;
  createdAt: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: string;
    companyName?: string | null;
    avatarUrl?: string | null;
  };
  media: Array<{ id: string; kind: 'IMAGE' | 'VIDEO'; publicUrl: string; thumbnailUrl?: string | null; isFeatured?: boolean }>;
}

interface PublicPropertiesPage {
  items: PublicPropertyRecord[];
  pagination: { hasNextPage: boolean };
}

const propertyTypes: PropertyType[] = [
  'House', 'Apartment', 'Villa', 'Townhouse', 'Bungalow', 'Residential Land',
  'Commercial Property', 'Shop & Retail', 'Farm & Agricultural Land',
  'Industrial Property', 'Holiday Home'
];

const propertyTypeAliases: Record<string, PropertyType> = {
  'Residential Villa': 'Villa'
};

function mapPublicProperty(record: PublicPropertyRecord): Property {
  const listingTypeMap: Record<string, ListingType> = {
    SALE: 'Sale',
    RENT: 'Rent',
    LEASE: 'Lease'
  };
  const listingType = listingTypeMap[record.listingType.toUpperCase()];
  if (!listingType) throw new Error(`Property ${record.id} has an unsupported listing type.`);
  const propertyType = propertyTypes.find((type) => type === record.propertyType)
    || propertyTypeAliases[record.propertyType];
  if (!propertyType) {
    throw new Error(`Property ${record.id} has an unsupported property type.`);
  }
  if (!SUPPORTED_CURRENCY_CODES.some((currency) => currency === record.currency)) {
    throw new Error(`Property ${record.id} uses unsupported currency "${record.currency}".`);
  }

  const images = record.media.filter((media) => media.kind === 'IMAGE');
  const video = record.media.find((media) => media.kind === 'VIDEO');
  const phone = record.owner.phone || '';
  const locationParts = [record.exactAddress, record.neighborhood, record.district, record.region, record.country].filter(Boolean);

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    propertyType,
    listingType,
    status: 'Available',
    verified: false,
    featured: Boolean(record.featured),
    isNew: false,
    price: Number(record.price),
    currency: record.currency as CurrencyCode,
    country: record.country,
    region: record.region,
    district: record.district,
    neighborhood: record.neighborhood || undefined,
    streetAddress: record.exactAddress || undefined,
    locationDetails: locationParts.join(', '),
    coordinates: { lat: record.latitude ?? 0, lng: record.longitude ?? 0 },
    bedrooms: record.bedrooms || 0,
    bathrooms: Number(record.bathrooms || 0),
    parkingSpaces: 0,
    sqft: record.landSizeSqFt ? Number(record.landSizeSqFt) : undefined,
    features: [],
    images: images.map((media) => media.publicUrl),
    imageThumbnails: images.map((media) => media.thumbnailUrl || media.publicUrl),
    videoUrl: video?.publicUrl,
    videoPosterUrl: video?.thumbnailUrl || undefined,
    videoType: video ? 'mp4' : undefined,
    dateAdded: record.createdAt,
    viewsCount: record.viewsCount || 0,
    savesCount: 0,
    agent: {
      id: record.owner.id,
      name: record.owner.fullName,
      company: record.owner.companyName || 'Independent Property Owner',
      phone,
      whatsapp: phone.replace(/\D/g, ''),
      email: record.owner.email,
      avatar: record.owner.avatarUrl || '',
      verified: false,
      activeListingsCount: 0,
      experienceYears: 0,
      bio: '',
      areaSpecialty: record.region,
      country: record.country
    }
  };
}

export async function getApprovedBackendProperties(): Promise<Property[]> {
  const token = getAccessToken();
  const allRecords: PublicPropertyRecord[] = [];
  let page = 1;
  let hasNextPage = true;
  while (hasNextPage) {
    const response = await fetch(`${API_BASE_URL}/properties?page=${page}&limit=100`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    const result = await response.json().catch(() => null) as {
      success?: boolean;
      message?: string;
      data?: PublicPropertiesPage;
    } | null;
    if (!response.ok || !result?.success || !result.data) {
      throw new Error(result?.message || 'Could not load approved property listings.');
    }
    allRecords.push(...result.data.items);
    hasNextPage = result.data.pagination.hasNextPage;
    page += 1;
  }
  return allRecords.map(mapPublicProperty);
}

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