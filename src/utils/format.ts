import { ListingType } from '../types';
import { CurrencyCode, RentalPeriod, formatPrice, formatCompactPrice, convertPrice } from './currency';

export function formatUGX(amount: number, listingType?: ListingType, rentalPeriod?: RentalPeriod): string {
  return formatPrice(amount, 'UGX', listingType, rentalPeriod);
}

export function formatCompactUGX(amount: number, listingType?: ListingType, rentalPeriod?: RentalPeriod): string {
  return formatCompactPrice(amount, 'UGX', listingType, rentalPeriod);
}

export function formatDisplayPrice(
  amount: number,
  originalCurrency: CurrencyCode = 'USD',
  userCurrency: CurrencyCode = 'USD',
  listingType?: ListingType,
  rentalPeriod: RentalPeriod = 'month'
): { text: string; subtext?: string; originalAsking: string; isConverted: boolean } {
  const originalAsking = formatPrice(amount, originalCurrency, listingType, rentalPeriod);

  if (originalCurrency === userCurrency || !amount) {
    return {
      text: originalAsking,
      originalAsking,
      isConverted: false
    };
  }

  // Convert to user's selected viewing currency
  const { converted } = convertPrice(amount, originalCurrency, userCurrency);
  const convertedText = formatPrice(converted, userCurrency, listingType, rentalPeriod);

  return {
    text: originalAsking,
    subtext: `≈ ${convertedText} (estimated at indicative benchmark)`,
    originalAsking,
    isConverted: true
  };
}

export function getWhatsAppLink(phone: string, propertyTitle?: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const text = propertyTitle
    ? `Hello! I am inquiring about the property listed on Sheltered Global Real Estate: "${propertyTitle}". Is it currently available for viewing and purchase/lease?`
    : `Hello! I found your agent profile on Sheltered Global Real Estate Marketplace and would like to inquire about available properties.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function getTelLink(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}
