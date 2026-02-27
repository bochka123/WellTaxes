import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/shared/lib/i18n/locales/en.json';
import uk from '@/shared/lib/i18n/locales/uk.json';

export const LANGUAGES = {
  en: 'English',
  uk: 'Українська',
} as const;

export type Language = keyof typeof LANGUAGES;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    uk: { translation: uk },
  },
  lng: (localStorage.getItem('lang') as Language | null) ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
