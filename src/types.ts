export type PropertyStatus = 'Available' | 'Pending' | 'Sold' | 'Rented' | 'Unavailable';

export type ListingType = 'Sale' | 'Rent';

export type PropertyType =
  | 'House'
  | 'Apartment'
  | 'Villa'
  | 'Townhouse'
  | 'Bungalow'
  | 'Commercial Property'
  | 'Land';

export type MukonoArea =
  | 'Mukono Municipality'
  | 'Mukono Town'
  | 'Seeta'
  | 'Namugongo'
  | 'Sonde'
  | 'Kyetume'
  | 'Namanoga'
  | 'Goma'
  | 'Nakisunga'
  | 'Katosi'
  | 'Wantoni';

export interface PropertyAmenity {
  id: string;
  label: string;
  icon?: string;
}

export interface PropertyAgent {
  id: string;
  name: string;
  company: string;
  phone: string;
  whatsapp: string;
  email: string;
  avatar: string;
  verified: boolean;
  activeListingsCount: number;
  experienceYears: number;
  bio: string;
  areaSpecialty: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  verified: boolean;
  featured: boolean;
  isNew: boolean;
  price: number; // In UGX (sale price or monthly rent)
  priceLabel?: string; // Optional custom string like "UGX 450M negotiable"
  area: MukonoArea;
  locationDetails: string; // e.g. "Seeta, Nabuti Road near Kampala University"
  coordinates: {
    lat: number;
    lng: number;
  };
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  sqft?: number; // House size
  plotSize?: string; // Land size e.g. "50 x 100 ft (12 decimals)", "25 decimals", "1 Acre"
  description: string;
  features: string[]; // List of amenity IDs/names
  images: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  dateAdded: string; // ISO date
  viewsCount: number;
  savesCount: number;
  agent: PropertyAgent;
  titleDeedStatus?: 'Mailo' | 'Freehold' | 'Leasehold' | 'Customary' | 'Ready Private Mailo';
}

export interface ViewingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyImage: string;
  listingType: ListingType;
  date: string;
  timeSlot: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface EnquiryMessage {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string;
  createdAt: string;
  status: 'Unread' | 'Replied';
}

export interface AreaInfo {
  id: MukonoArea;
  name: string;
  tagline: string;
  description: string;
  image: string;
  distanceFromKampala: string;
  avgSalePrice: string;
  avgRentPrice: string;
  coordinates: { lat: number; lng: number };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'landlord' | 'agent' | 'admin';
  avatar?: string;
}

export interface FilterState {
  listingType?: ListingType | 'All';
  area?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | 'Any';
  bathrooms?: number | 'Any';
  amenities: string[];
  searchQuery?: string;
  sortBy: 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'views';
}
