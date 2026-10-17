import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import frCommon from './locales/fr/common.json';
import frNavigation from './locales/fr/navigation.json';
import swCommon from './locales/sw/common.json';
import swNavigation from './locales/sw/navigation.json';
import arCommon from './locales/ar/common.json';
import arNavigation from './locales/ar/navigation.json';

export const resources = {
  en: { common: enCommon, navigation: enNavigation },
  fr: { common: frCommon, navigation: frNavigation },
  sw: { common: swCommon, navigation: swNavigation },
  ar: { common: arCommon, navigation: arNavigation }
};

const collectKeys = (value: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, nestedValue]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof nestedValue === 'object' && nestedValue !== null && !Array.isArray(nestedValue)) {
      return collectKeys(nestedValue as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });

export const getMissingResourceKeys = (): Record<string, string[]> => {
  const sourceKeys = collectKeys(resources.en);
  return Object.fromEntries(
    Object.entries(resources)
      .filter(([locale]) => locale !== 'en')
      .map(([locale, localeResources]) => {
        const translatedKeys = new Set(collectKeys(localeResources));
        return [locale, sourceKeys.filter((key) => !translatedKeys.has(key))];
      })
  );
};
