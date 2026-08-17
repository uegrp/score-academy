import { useTranslation } from 'react-i18next'
import ProgramCard from '../../components/cards/ProgramCard'
import { useCollection } from '../../hooks/useCollection'
import type { Program } from '../../types'
import { orderBy } from '../../lib/collections'

export default function Programs() {
  const { t } = useTranslation()
  const { data, loading } = useCollection<Program>('programs', [orderBy('order', 'asc')])

  const FALLBACK = [
    { id: 'mini-stars', name: t('programsPage.miniStars'), ageRange: 'Ages 5–7', description: t('programsPage.miniStarsDesc') },
    { id: 'junior', name: t('programsPage.junior'), ageRange: 'Ages 8–10', description: t('programsPage.juniorDesc') },
    { id: 'youth', name: t('programsPage.youth'), ageRange: 'Ages 11–13', description: t('programsPage.youthDesc') },
    { id: 'advanced', name: t('programsPage.advanced'), ageRange: 'Ages 14–17', description: t('programsPage.advancedDesc') },
  ]
  const programs = data.length > 0 ? data : FALLBACK

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 pb-28 md:px-8 lg:pb-16">
      <p className="eyebrow text-grass">{t('programsPage.eyebrow')}</p>
      <h1 className="mt-2 text-4xl text-pitch md:text-5xl">{t('programsPage.title')}</h1>
      <p className="mt-3 max-w-xl text-pitch/70">{t('programsPage.subtitle')}</p>

      {loading ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-card bg-line-soft/20" />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <ProgramCard key={p.id} name={p.name} ageRange={p.ageRange} description={p.description} />
          ))}
        </div>
      )}
    </div>
  )
}
