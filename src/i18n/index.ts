import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';
import { RTL_LANGUAGES } from './languages';

// Prepare i18next resource bundle from translation dictionaries
const resources: Record<string, { translation: Record<string, string> }> = {};
Object.keys(translations).forEach((langKey) => {
  resources[langKey] = {
    translation: translations[langKey]
  };
});

// Determine initial saved language or default to 'en'
const getInitialLanguage = (): string => {
  try {
    const saved = localStorage.getItem('sheltered_user_lang_v3');
    if (saved && resources[saved]) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'en';
};

const initialLang = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React already safely escapes values
  }
});

// Sync document dir and lang attributes on initial load
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
  document.documentElement.dir = RTL_LANGUAGES.includes(initialLang) ? 'rtl' : 'ltr';
}

export default i18n;
