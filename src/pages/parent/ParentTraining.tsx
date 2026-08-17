import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import type { Player, Team, TrainingSession } from '../../types'
import { where } from '../../lib/collections'
import EmptyState from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormField'

export default function ParentTraining() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const { data: players } = useCollection<Player>('players', appUser ? [where('parentUserIds', 'array-contains', appUser.uid)] : [])
  const [playerId, setPlayerId] = useState('')

  const activePlayer = players.find((p) => p.id === playerId) ?? players[0]

  const { data: teams } = useCollection<Team>('teams')
  const { data: sessions, loading } = useCollection<TrainingSession>(
    'trainingSessions',
    activePlayer?.teamId ? [where('teamId', '==', activePlayer.teamId)] : [],
    [activePlayer?.teamId]
  )

  const upcoming = [...sessions]
    .filter((s) => s.status !== 'cancelled')
    .sort((a, b) => a.date - b.date)

  const teamName = (id: string) => teams.find((tm) => tm.id === id)?.name ?? ''

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('parent.training')}</h1>

      {players.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('emptyStates.noPlayerLinked')} hint={t('emptyStates.noPlayerLinkedHint')} />
        </div>
      ) : (
        <>
          {players.length > 1 && (
            <div className="mt-5 max-w-xs">
              <Select
                label={t('parent.player')}
                value={playerId || players[0].id}
                onChange={(e) => setPlayerId(e.target.value)}
                options={players.map((p) => ({ value: p.id, label: p.fullName }))}
              />
            </div>
          )}

          <div className="mt-6">
            {!activePlayer?.teamId ? (
              <EmptyState title={t('emptyStates.noTeamAssigned')} />
            ) : loading ? (
              <div className="h-32 animate-pulse rounded-card bg-line-soft/30" />
            ) : upcoming.length === 0 ? (
              <EmptyState title={t('emptyStates.noTraining')} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {upcoming.map((s) => (
                  <div key={s.id} className="rounded-card border border-line-soft bg-white p-4">
                    <p className="font-medium text-pitch">{s.type}</p>
                    <p className="text-sm text-pitch/60">
                      {teamName(s.teamId)} · {new Date(s.date).toLocaleDateString()} · {s.time}
                    </p>
                    <p className="text-sm text-pitch/60">{s.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
