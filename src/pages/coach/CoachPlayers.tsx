import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import EmptyState from '../../components/ui/EmptyState'
import { StaggerContainer, StaggerItem } from '../../components/motion/Stagger'
import type { Player, Team } from '../../types'
import { where } from '../../lib/collections'

export default function CoachPlayers() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const teamIds = appUser?.linkedTeamIds ?? []

  const { data: teams } = useCollection<Team>(
    'teams',
    teamIds.length ? [where('__name__', 'in', teamIds.slice(0, 10))] : [],
    [teamIds.join(',')]
  )
  const { data: players, loading } = useCollection<Player>(
    'players',
    teamIds.length ? [where('teamId', 'in', teamIds.slice(0, 10))] : [],
    [teamIds.join(',')]
  )

  const teamName = (id?: string) => teams.find((tm) => tm.id === id)?.name ?? '—'
  const statusLabel: Record<string, string> = {
    active: t('common.active'),
    pending: t('common.pending'),
    archived: t('common.archived'),
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('coach.yourPlayers')}</h1>

      <div className="mt-6">
        {teamIds.length === 0 ? (
          <EmptyState title={t('emptyStates.noTeamsAssignedYet')} hint={t('emptyStates.noTeamsAssignedHint')} />
        ) : loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : players.length === 0 ? (
          <EmptyState title={t('emptyStates.noPlayersInTeam')} />
        ) : (
          <StaggerContainer className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {players.map((p) => (
              <StaggerItem key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-pitch">{p.fullName}</p>
                  <p className="text-sm text-pitch/60">
                    {p.preferredPosition} · {teamName(p.teamId)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    p.status === 'active' ? 'bg-grass/10 text-grass' : 'bg-pitch/10 text-pitch/60'
                  }`}
                >
                  {statusLabel[p.status]}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  )
}
