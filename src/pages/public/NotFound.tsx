import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../../components/ui/Button'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="eyebrow text-grass">{t('notFound.eyebrow')}</p>
      <h1 className="text-4xl text-pitch">{t('notFound.title')}</h1>
      <p className="text-pitch/60">{t('notFound.body')}</p>
      <Link to="/">
        <Button>{t('common.backToHome')}</Button>
      </Link>
    </div>
  )
}
