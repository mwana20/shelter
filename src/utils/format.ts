import { ListingType } from '../types';

export function formatUGX(amount: number, listingType?: ListingType, currencyCode = 'UGX'): string {
  if (!amount && amount !== 0) return 'Price on Request';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount);
  if (listingType === 'Rent') {
    return `${formatted} / month`;
  }
  return formatted;
}

export function formatCompactUGX(amount: number, listingType?: ListingType, currencyCode = 'UGX'): string {
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  });
  if (!amount) return currency.format(0);
  if (amount >= 1_000_000_000) {
    const b = (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return listingType === 'Rent' ? `${currency.format(Number(b))}B/mo` : `${currency.format(Number(b))} Billion`;
  }
  if (amount >= 1_000_000) {
    const m = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return listingType === 'Rent' ? `${currency.format(Number(m))}M/mo` : `${currency.format(Number(m))}M`;
  }
  if (amount >= 1_000) {
    const k = (amount / 1_000).toFixed(0);
    return listingType === 'Rent' ? `${currency.format(Number(k))}K/mo` : `${currency.format(Number(k))}K`;
  }
  return currency.format(amount);
}

export function getWhatsAppLink(phone: string, propertyTitle?: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const text = propertyTitle
    ? `Hello! I am inquiring about the property on Sheltered: "${propertyTitle}". Is it still available for inspection?`
    : `Hello! I found your listing on Sheltered and would like to inquire about available properties.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function getTelLink(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}
