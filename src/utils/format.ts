import { ListingType } from '../types';

export function formatUGX(amount: number, listingType?: ListingType): string {
  if (!amount && amount !== 0) return 'Price on Request';
  const formatted = new Intl.NumberFormat('en-US').format(amount);
  if (listingType === 'Rent') {
    return `UGX ${formatted} / month`;
  }
  return `UGX ${formatted}`;
}

export function formatCompactUGX(amount: number, listingType?: ListingType): string {
  if (!amount) return 'UGX 0';
  if (amount >= 1_000_000_000) {
    const b = (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return listingType === 'Rent' ? `UGX ${b}B/mo` : `UGX ${b} Billion`;
  }
  if (amount >= 1_000_000) {
    const m = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return listingType === 'Rent' ? `UGX ${m}M/mo` : `UGX ${m}M`;
  }
  if (amount >= 1_000) {
    const k = (amount / 1_000).toFixed(0);
    return listingType === 'Rent' ? `UGX ${k}K/mo` : `UGX ${k}K`;
  }
  return `UGX ${amount}`;
}

export function getWhatsAppLink(phone: string, propertyTitle?: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const text = propertyTitle
    ? `Hello! I am inquiring about the property on Sheltered Mukono: "${propertyTitle}". Is it still available for inspection?`
    : `Hello! I found your listing on Sheltered Mukono and would like to inquire about available properties.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function getTelLink(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}
