export type CurrencyCode = 'UGX' | 'USD' | 'GBP' | 'EUR' | 'KES' | 'TZS' | 'ZAR';

export type RentalPeriod = 'month' | 'week' | 'night' | 'year';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 unit of USD = how many units of this currency (standard FX base)
}

// Indicative benchmark demonstration rates (clearly marked as frontend demo dataset)
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateToUSD: 1.0,
  },
  UGX: {
    code: 'UGX',
    symbol: 'UGX',
    name: 'Ugandan Shilling',
    rateToUSD: 3750,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateToUSD: 0.79,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateToUSD: 0.92,
  },
  KES: {
    code: 'KES',
    symbol: 'KES',
    name: 'Kenyan Shilling',
    rateToUSD: 130,
  },
  TZS: {
    code: 'TZS',
    symbol: 'TZS',
    name: 'Tanzanian Shilling',
    rateToUSD: 2600,
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'ZAR',
    name: 'South African Rand',
    rateToUSD: 18.2,
  },
};

export const SUPPORTED_CURRENCY_CODES: CurrencyCode[] = [
  'UGX',
  'USD',
  'GBP',
  'EUR',
  'KES',
  'TZS',
  'ZAR',
];

/**
 * Converts price from one currency to another using the demonstration rate dataset.
 */
export function convertPrice(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): { converted: number; original: number; isConverted: boolean } {
  if (from === to || !amount) {
    return { converted: amount, original: amount, isConverted: false };
  }
  const fromCfg = CURRENCIES[from] || CURRENCIES.USD;
  const toCfg = CURRENCIES[to] || CURRENCIES.USD;

  // Amount in USD = amount / rateToUSD
  const inUSD = amount / fromCfg.rateToUSD;
  const inTarget = inUSD * toCfg.rateToUSD;

  // Round UGX and TZS to integers, others to 2 decimals or rounded integer if large
  let converted = inTarget;
  if (to === 'UGX' || to === 'TZS' || to === 'KES') {
    converted = Math.round(converted);
  } else {
    converted = Math.round(converted);
  }

  return { converted, original: amount, isConverted: true };
}

/**
 * Format a price with currency symbol, locale thousands separators, and rental period.
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode = 'USD',
  listingType?: 'Sale' | 'Rent' | 'Lease' | 'Buy',
  rentalPeriod: RentalPeriod = 'month'
): string {
  if (!amount && amount !== 0) return 'Price on Request';

  const cfg = CURRENCIES[currency] || CURRENCIES.USD;
  const formatted = new Intl.NumberFormat('en-US').format(amount);

  let result = `${cfg.symbol} ${formatted}`;

  if (listingType === 'Rent' || listingType === 'Lease') {
    const periodMap: Record<RentalPeriod, string> = {
      month: '/mo',
      week: '/wk',
      night: '/night',
      year: '/yr',
    };
    result += ` ${periodMap[rentalPeriod] || '/mo'}`;
  }

  return result;
}

/**
 * Formats price in compact millions/billions/thousands notation for maps and compact cards.
 */
export function formatCompactPrice(
  amount: number,
  currency: CurrencyCode = 'USD',
  listingType?: 'Sale' | 'Rent' | 'Lease' | 'Buy',
  rentalPeriod: RentalPeriod = 'month'
): string {
  if (!amount && amount !== 0) return 'Price on Request';
  const cfg = CURRENCIES[currency] || CURRENCIES.USD;

  let text = '';
  if (amount >= 1_000_000_000) {
    text = `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  } else if (amount >= 1_000_000) {
    text = `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (amount >= 1_000) {
    text = `${(amount / 1_000).toFixed(0)}K`;
  } else {
    text = `${amount}`;
  }

  let result = `${cfg.symbol} ${text}`;
  if (listingType === 'Rent' || listingType === 'Lease') {
    result += rentalPeriod === 'night' ? '/nt' : '/mo';
  }
  return result;
}
