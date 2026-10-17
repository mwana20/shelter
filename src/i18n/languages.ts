export interface LanguageOption {
  code: string;
  label: string;
  available: boolean;
  direction: 'ltr' | 'rtl';
}

export const languageOptions: LanguageOption[] = [
  { code: 'en', label: 'English', available: true, direction: 'ltr' },
  { code: 'fr', label: 'Français', available: true, direction: 'ltr' },
  { code: 'sw', label: 'Kiswahili', available: true, direction: 'ltr' },
  { code: 'ar', label: 'العربية', available: true, direction: 'rtl' },
  { code: 'es', label: 'Español', available: false, direction: 'ltr' },
  { code: 'pt', label: 'Português', available: false, direction: 'ltr' },
  { code: 'de', label: 'Deutsch', available: false, direction: 'ltr' },
  { code: 'zh', label: '简体中文', available: false, direction: 'ltr' },
  { code: 'hi', label: 'हिन्दी', available: false, direction: 'ltr' },
  { code: 'bn', label: 'বাংলা', available: false, direction: 'ltr' },
  { code: 'ur', label: 'اردو', available: false, direction: 'rtl' },
  { code: 'ru', label: 'Русский', available: false, direction: 'ltr' },
  { code: 'ja', label: '日本語', available: false, direction: 'ltr' },
  { code: 'ko', label: '한국어', available: false, direction: 'ltr' },
  { code: 'tr', label: 'Türkçe', available: false, direction: 'ltr' },
  { code: 'it', label: 'Italiano', available: false, direction: 'ltr' },
  { code: 'nl', label: 'Nederlands', available: false, direction: 'ltr' },
  { code: 'id', label: 'Bahasa Indonesia', available: false, direction: 'ltr' },
  { code: 'ms', label: 'Bahasa Melayu', available: false, direction: 'ltr' },
  { code: 'fa', label: 'فارسی', available: false, direction: 'rtl' }
];

export const enabledLanguages = languageOptions.filter((language) => language.available);