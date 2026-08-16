import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import EmptyState from '../../components/ui/EmptyState'
import type { Player, Team } from '../../types'
import { where } from '../../lib/collections'

export default function CoachPlayers() {
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

  const teamName = (id?: string) => teams.find((t) => t.id === id)?.name ?? '—'

  return (
    <div>
      <h1 className="text-3xl text-pitch">Your players</h1>

      <div className="mt-6">
        {teamIds.length === 0 ? (
          <EmptyState title="No teams assigned yet" hint="An admin will assign your teams from the admin panel." />
        ) : loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : players.length === 0 ? (
          <EmptyState title="No players in your teams yet" />
        ) : (
          <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {players.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4">
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
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
