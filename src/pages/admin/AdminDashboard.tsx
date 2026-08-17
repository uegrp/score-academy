import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'
import type { Player, Coach, Team, Match, Registration } from '../../types'
import { where } from '../../lib/collections'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { data: players } = useCollection<Player>('players')
  const { data: coaches } = useCollection<Coach>('coaches')
  const { data: teams } = useCollection<Team>('teams')
  const { data: matches } = useCollection<Match>('matches')
  const { data: pending } = useCollection<Registration>('registrations', [where('status', '==', 'pending')])

  const activePlayers = players.filter((p) => p.status === 'active')

  return (
    <div>
      <p className="eyebrow text-grass">{t('admin.dashboardEyebrow')}</p>
      <h1 className="mt-2 text-4xl text-pitch">{t('admin.overview')}</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('admin.totalPlayers')} value={players.length} size="lg" />
        <StatCard label={t('admin.activePlayers')} value={activePlayers.length} size="lg" />
        <StatCard label={t('admin.coaches')} value={coaches.length} size="lg" />
        <StatCard label={t('admin.teams')} value={teams.length} size="lg" />
        <StatCard label={t('admin.upcomingMatches')} value={matches.filter((m) => m.date > Date.now()).length} size="lg" />
        <StatCard label={t('admin.pendingRegistrations')} value={pending.length} highlight={pending.length > 0} size="lg" />
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('admin.pendingRegistrations')}</h2>
        {pending.length === 0 ? (
          <EmptyState title={t('emptyStates.noRegistrations')} hint={t('emptyStates.noRegistrationsHint')} />
        ) : (
          <div className="mt-4 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-pitch">{r.player.fullName}</p>
                  <p className="text-sm text-pitch/60">
                    {r.parentName} · {r.parentEmail}
                  </p>
                </div>
                <span className="rounded-full bg-warn/10 px-3 py-1 text-xs font-medium text-warn">{t('common.pending')}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
