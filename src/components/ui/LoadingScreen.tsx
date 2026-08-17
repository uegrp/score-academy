import { useTranslation } from 'react-i18next'

export default function LoadingScreen() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen items-center justify-center bg-pitch">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-soft border-t-grass-bright" />
        <p className="eyebrow text-bone-dim">{t('common.loadingScore')}</p>
      </div>
    </div>
  )
}
