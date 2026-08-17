import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en/translation.json'
import ar from '../locales/ar/translation.json'

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const STORAGE_KEY = 'score-language'

function getInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ar') return stored
  return 'en'
}

export function applyDocumentDirection(lang: SupportedLanguage) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// Keep <html lang/dir> in sync, including on first load.
applyDocumentDirection(i18n.language as SupportedLanguage)

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng)
  applyDocumentDirection(lng as SupportedLanguage)
})

export default i18n
