import { CurrencyCode, RentalPeriod } from './utils/currency';

export type PropertyStatus =
  | 'Available'
  | 'Pending'
  | 'Published'
  | 'Draft'
  | 'Under Review'
  | 'Rejected'
  | 'Sold'
  | 'Rented'
  | 'Leased'
  | 'Unavailable';

export type ListingType = 'Sale' | 'Rent' | 'Lease' | 'Buy';

export type PropertyType =
  | 'House'
  | 'Apartment'
  | 'Villa'
  | 'Townhouse'
  | 'Bungalow'
  | 'Residential Land'
  | 'Commercial Property'
  | 'Shop & Retail'
  | 'Farm & Agricultural Land'
  | 'Industrial Property'
  | 'Holiday Home';

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
  city?: string;
  country?: string;
  agencyLicense?: string;
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
  price: number;
  currency: CurrencyCode;
  rentalPeriod?: RentalPeriod;
  priceNegotiable?: boolean;
  country: string; // e.g. "Uganda", "Kenya", "United Arab Emirates", "United Kingdom", "United States"
  region: string; // State / Province / Administrative Region
  district: string; // District / County / Municipality
  cityOrTown?: string; // City / Town / Division
  subcounty?: string; // Backward compatibility alias
  neighborhood?: string; // Neighborhood / Village / Suburb
  area?: string; // Short locality string
  streetAddress?: string;
  locationDetails: string; // Formatted full human-readable location
  coordinates: {
    lat: number;
    lng: number;
  };
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  sqft?: number; // Building or floor size in sq ft or sqm
  sizeUnit?: 'sqft' | 'sqm' | 'decimals' | 'acres' | 'hectares';
  plotSize?: string; // Land dimension e.g. "50 x 100 ft", "25 decimals", "2.5 Acres"
  description: string;
  features: string[]; // Amenities checklist
  images: string[]; // High-res photos
  videoUrl?: string; // Video walkthrough link (YouTube, Vimeo, MP4)
  videoType?: 'youtube' | 'mp4' | 'vimeo';
  titleDeedStatus?:
    | 'Ready Private Mailo'
    | 'Freehold'
    | 'Leasehold'
    | 'Customary'
    | 'Title Deed Verified'
    | 'Certificate of Occupancy'
    | 'Deed Pending Verification'
    | 'Torrens Title';
  dateAdded: string; // ISO date
  viewsCount: number;
  savesCount: number;
  enquiriesCount?: number;
  agent: PropertyAgent;
  moderationNotes?: string;
  approvalDate?: string;
  approvedBy?: string;
}

export interface ViewingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyCurrency: CurrencyCode;
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

export interface DestinationInfo {
  id: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  image: string;
  listingCount?: number;
  popularTypes?: string[];
  distanceFromHQ?: string;
  avgSalePrice?: string;
  avgRentPrice?: string;
  coordinates: { lat: number; lng: number };
}

// Backward compatibility alias for existing AreaInfo imports
export type AreaInfo = DestinationInfo;

export type UserRole =
  | 'owner' // Property Owner / Landlord
  | 'landlord'
  | 'agent' // Property Agent
  | 'broker' // Property Broker
  | 'buyer' // Buyer or Tenant
  | 'tenant'
  | 'admin'
  | 'superadmin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  preferredLanguage: string;
  preferredCurrency: CurrencyCode;
  companyName?: string;
  agencyLicense?: string;
  sellerType?: 'individual_owner' | 'landlord' | 'licensed_agent' | 'property_broker' | 'property_developer';
  verificationStatus?: 'Unverified' | 'Pending Review' | 'Verified';
  verificationDocuments?: string[];
  bio?: string;
  country?: string;
  city?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  privacyAcknowledged: boolean;
  dob?: string;
  age?: number;
  unlockedPropertyIds?: string[];
}

export interface OtpSession {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  lastSentAt: number;
  type: 'email_verification' | 'password_reset' | 'admin_2fa';
}

export interface TransactionalEmail {
  id: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  type: 'otp_verification' | 'welcome' | 'property_approved' | 'property_rejected' | 'payment_receipt' | 'viewing_scheduled' | 'enquiry_received';
  sentAt: string;
  status: 'Delivered' | 'Pending' | 'Failed';
  provider: 'Direct_SMTP' | 'SendGrid' | 'Resend' | 'Internal_Relay';
}

export type PaymentMethod =
  | 'MTN_MOMO'
  | 'AIRTEL_MONEY'
  | 'VISA'
  | 'MASTERCARD'
  | 'FLUTTERWAVE'
  | 'PESAPAL'
  | 'STRIPE';

export interface PaymentTransaction {
  id: string;
  reference: string;
  purpose: 'listing_fee' | 'featured_promotion' | 'agent_subscription' | 'verification_inspection';
  title: string;
  amount: number;
  currency: CurrencyCode;
  method: PaymentMethod;
  phoneNumber?: string;
  payerName: string;
  payerEmail: string;
  propertyId?: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  createdAt: string;
  gatewayTxId: string;
  receiptNumber: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: 'Property' | 'User' | 'Location' | 'Settings' | 'Payment';
  targetId?: string;
  details: string;
}

export interface CompanySettings {
  companyName: string;
  hqCity: string;
  hqCountry: string;
  hqAddress: string;
  primaryPhone: string;
  secondaryPhone: string;
  whatsapp: string;
  officialEmail: string;
  supportEmail: string;
  businessHours: string;
  registrationNumber: string;
  defaultCurrency: CurrencyCode;
  defaultLanguage: string;
  flutterwavePublicKey?: string;
  pesapalConsumerKey?: string;
  stripePublishableKey?: string;
  smtpConfigured: boolean;
}

export interface FilterState {
  listingType?: ListingType | 'All';
  country?: string;
  region?: string;
  district?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: CurrencyCode;
  bedrooms?: number | 'Any';
  bathrooms?: number | 'Any';
  amenities: string[];
  searchQuery?: string;
  sortBy: 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'views';
}

export interface LocationLockSettings {
  enabledGlobally: boolean; // MUST BE FALSE BY DEFAULT
  lockedPropertyIds: string[]; // Specific property overrides
  lockedRegions: string[]; // Specific region/area overrides
  unlockFeeAmount: number; // e.g. 15 or 55000
  unlockFeeCurrency: CurrencyCode; // e.g. 'USD' or 'UGX'
  gatewayEnabled: boolean; // Professional gateway option (Visa, Mastercard, PayPal)
  merchantCodeEnabled: boolean; // Merchant code option
  merchantCode: string; // e.g. "SHELTER-MBL-784"
  merchantName: string; // e.g. "Sheltered Global Escrow Services Ltd"
  paymentInstructions: string;
  supportedChannels: string[]; // e.g. ["MTN MoMo (Pay *165*3#)", "Airtel Money (*185*9#)", "Bank Wire / Swift", "Stanbic FlexiPay"]
  txIdRules: {
    minLength: number;
    maxLength: number;
    pattern: string; // Regex string e.g. "^[A-Za-z0-9_-]+$"
    description: string;
  };
  verificationMode: 'automatic' | 'manual'; // Automatic via provider vs manual admin review
}

export interface LocationUnlockPayment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: 'GATEWAY_CARD' | 'GATEWAY_PAYPAL' | 'MERCHANT_CODE';
  gatewayReference?: string;
  submittedTransactionId?: string;
  status: 'pending' | 'paid' | 'verified' | 'rejected' | 'duplicate' | 'failed' | 'expired';
  submissionDate: string; // ISO date string
  verificationDate?: string;
  adminNotes?: string;
  rejectionReason?: string;
  manualUnlockReason?: string;
  clientIp?: string;
}

export interface UnlockedLocationData {
  propertyId: string;
  streetAddress: string;
  locationDetails: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  directionsUrl?: string;
  unlockedAt: string;
}

export interface UserRegistrationPayload {
  name: string;
  email: string;
  phone: string;
  dob: string; // YYYY-MM-DD
  password: string;
  confirmPassword: string;
  country: string;
  role: UserRole;
  companyName?: string;
  agencyLicense?: string;
}

