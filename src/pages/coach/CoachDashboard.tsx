import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import EmptyState from '../../components/ui/EmptyState'
import type { Team, Player } from '../../types'
import { where } from '../../lib/collections'

export default function CoachDashboard() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const teamIds = appUser?.linkedTeamIds ?? []

  const { data: teams, loading: teamsLoading } = useCollection<Team>(
    'teams',
    teamIds.length ? [where('__name__', 'in', teamIds.slice(0, 10))] : [],
    [teamIds.join(',')]
  )
  const { data: players } = useCollection<Player>(
    'players',
    teamIds.length ? [where('teamId', 'in', teamIds.slice(0, 10))] : [],
    [teamIds.join(',')]
  )

  return (
    <div>
      <p className="eyebrow text-grass">{t('coach.dashboardEyebrow')}</p>
      <h1 className="mt-2 text-4xl text-pitch">
        {t('coach.welcome', { name: appUser?.displayName ? `, Coach ${appUser.displayName.split(' ')[0]}` : '' })}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label={t('coach.assignedTeams')} value={teams.length} />
        <StatCard label={t('coach.players')} value={players.length} />
        <StatCard label={t('coach.sessionsToday')} value={0} />
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('coach.yourTeams')}</h2>
        {teamsLoading ? (
          <div className="mt-4 h-20 animate-pulse rounded-card bg-line-soft/30" />
        ) : teams.length === 0 ? (
          <EmptyState title={t('emptyStates.noTeamsAssignedYet')} hint={t('emptyStates.noTeamsAssignedHint')} />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {teams.map((team) => (
              <div key={team.id} className="rounded-card border border-line-soft bg-white p-5">
                <p className="text-lg font-semibold text-pitch">{team.name}</p>
                <p className="text-sm text-pitch/60">
                  {team.ageGroup} · {team.playerIds?.length ?? 0} {t('teamsPage.players')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-line-soft bg-white p-5">
      <p className="stat-figure text-3xl text-pitch">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-pitch/60">{label}</p>
    </div>
  )
}
