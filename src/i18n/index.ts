import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getInitialLanguage } from './languages';
import { getMissingResourceKeys, resources } from './resources';

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: Object.keys(resources),
    defaultNS: 'navigation',
    ns: ['common', 'navigation'],
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (languages, namespace, key) => {
      console.warn(`[i18n] Missing translation key "${namespace}:${key}" for ${languages.join(', ')}.`);
    }
  });

if (import.meta.env.DEV) {
  const missingKeys = getMissingResourceKeys();
  for (const [locale, keys] of Object.entries(missingKeys)) {
    if (keys.length > 0) {
      console.warn(`[i18n] ${locale} is missing English resource keys: ${keys.join(', ')}.`);
    }
  }
}

export default i18n;
