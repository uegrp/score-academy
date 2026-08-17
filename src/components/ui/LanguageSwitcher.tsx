import { useTranslation } from 'react-i18next'

interface Props {
  variant?: 'light' | 'dark'
}

/** EN / العربية toggle. Persists via i18next's languageChanged handler (see lib/i18n.ts). */
export default function LanguageSwitcher({ variant = 'dark' }: Props) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  function toggle() {
    i18n.changeLanguage(isArabic ? 'en' : 'ar')
  }

  const base =
    variant === 'dark'
      ? 'border-line-soft text-bone-dim hover:text-bone hover:border-bone-dim'
      : 'border-line text-pitch/70 hover:text-pitch hover:border-pitch/40'

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${base}`}
      aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      {isArabic ? 'English' : 'العربية'}
    </button>
  )
}
