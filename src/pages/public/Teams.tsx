import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import EmptyState from '../../components/ui/EmptyState'
import type { Team } from '../../types'

export default function Teams() {
  const { t } = useTranslation()
  const { data: teams, loading, isEmpty } = useCollection<Team>('teams')

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 pb-28 md:px-8 lg:pb-16">
      <p className="eyebrow text-grass">{t('teamsPage.eyebrow')}</p>
      <h1 className="mt-2 text-4xl text-pitch md:text-5xl">{t('teamsPage.title')}</h1>

      {loading ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-card bg-line-soft/20" />)}
        </div>
      ) : isEmpty ? (
        <div className="mt-10">
          <EmptyState title={t('emptyStates.noTeams')} hint={t('emptyStates.noTeamsHint')} />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t2) => (
            <div key={t2.id} className="rounded-card border border-line-soft bg-white p-6">
              <p className="eyebrow text-grass">{t2.ageGroup}</p>
              <h2 className="mt-2 text-2xl text-pitch">{t2.name}</h2>
              <p className="mt-2 text-sm text-pitch/60">
                {t2.playerIds?.length ?? 0} {t('teamsPage.players')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
