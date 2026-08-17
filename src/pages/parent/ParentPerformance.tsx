import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import type { Player, PerformanceEvaluation } from '../../types'
import { where } from '../../lib/collections'
import EmptyState from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormField'
import PlayerAttributeCard from '../../components/cards/PlayerAttributeCard'

export default function ParentPerformance() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const { data: players } = useCollection<Player>('players', appUser ? [where('parentUserId', '==', appUser.uid)] : [])
  const [playerId, setPlayerId] = useState('')

  const activePlayer = players.find((p) => p.id === playerId) ?? players[0]

  const { data: evaluations, loading } = useCollection<PerformanceEvaluation>(
    'performanceEvaluations',
    activePlayer ? [where('playerId', '==', activePlayer.id)] : [],
    [activePlayer?.id]
  )

  const sorted = [...evaluations].sort((a, b) => b.date - a.date)
  const latest = sorted[0]

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('parent.performance')}</h1>

      {players.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('emptyStates.noPlayerLinked')} />
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

          {loading ? (
            <div className="mt-6 h-64 animate-pulse rounded-card bg-line-soft/30" />
          ) : !latest ? (
            <div className="mt-6">
              <EmptyState title={t('emptyStates.noEvaluations')} hint={t('emptyStates.noEvaluationsHint')} />
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-pitch/60">
                  {t('parent.latestEvaluation')} · {new Date(latest.date).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-6">
                  <PlayerAttributeCard
                    name={activePlayer!.fullName}
                    subtitle={activePlayer!.preferredPosition}
                    variant="gold"
                    stats={[
                      { code: 'PAS', label: 'Passing', level: latest.technical.passing },
                      { code: 'DRB', label: 'Dribbling', level: latest.technical.dribbling },
                      { code: 'CTL', label: 'Ball Control', level: latest.technical.ballControl },
                      { code: 'SHT', label: 'Shooting', level: latest.technical.shooting },
                      { code: 'SPD', label: 'Speed', level: latest.physical.speed },
                      { code: 'TWK', label: 'Teamwork', level: latest.mental.teamwork },
                    ]}
                  />
                </div>
                {latest.notes && (
                  <p className="mt-4 max-w-lg rounded-card border border-line-soft bg-white p-4 text-sm text-pitch/70">
                    <span className="font-medium text-pitch">{t('parent.coachNotes')} </span>
                    {latest.notes}
                  </p>
                )}
              </div>

              {sorted.length > 1 && (
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('parent.history')}</p>
                  <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
                    {sorted.slice(1).map((ev) => (
                      <div key={ev.id} className="p-4 text-sm text-pitch/70">
                        {new Date(ev.date).toLocaleDateString()} — {ev.notes || t('parent.noNotesRecorded')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
