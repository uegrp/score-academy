import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { where, orderBy } from '../../lib/collections'
import type { Player, PerformanceEvaluation, MatchPlayerStat, AttendanceRecord } from '../../types'
import { computeFifaAttributes } from '../../lib/fifaCard'
import FifaPlayerCard from '../../components/player/FifaPlayerCard'
import ProgressChart from '../../components/player/ProgressChart'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'

export default function PlayerPerformance() {
  const { t } = useTranslation()
  const { appUser } = useAuth()

  const { data: players } = useCollection<Player>('players', appUser ? [where('playerUserId', '==', appUser.uid)] : [])
  const player = players[0]

  const { data: evaluations, loading } = useCollection<PerformanceEvaluation>(
    'performanceEvaluations',
    player ? [where('playerId', '==', player.id), orderBy('date', 'desc')] : [],
    [player?.id]
  )
  const { data: matchStats } = useCollection<MatchPlayerStat>(
    'matchPlayerStats',
    player ? [where('playerId', '==', player.id)] : [],
    [player?.id]
  )
  const { data: attendance } = useCollection<AttendanceRecord>(
    'attendance',
    player ? [where('playerId', '==', player.id)] : [],
    [player?.id]
  )

  if (!player) {
    return (
      <div>
        <h1 className="text-3xl text-pitch">{t('parent.performance')}</h1>
        <div className="mt-6">
          <EmptyState title={t('player.notLinkedYet')} hint={t('player.notLinkedYetHint')} />
        </div>
      </div>
    )
  }

  const latest = evaluations[0]

  const totals = matchStats.reduce(
    (acc, s) => ({
      goals: acc.goals + s.goals,
      assists: acc.assists + s.assists,
      tackles: acc.tackles + s.tackles,
      minutesPlayed: acc.minutesPlayed + s.minutesPlayed,
    }),
    { goals: 0, assists: 0, tackles: 0, minutesPlayed: 0 }
  )
  const matchesPlayed = matchStats.length
  const trainingSessions = attendance.length
  const present = attendance.filter((a) => a.status === 'present').length
  const late = attendance.filter((a) => a.status === 'late').length
  const attendancePct = trainingSessions > 0 ? Math.round(((present + late * 0.5) / trainingSessions) * 100) : null

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('parent.performance')}</h1>

      {loading ? (
        <div className="mt-6 h-96 animate-pulse rounded-card bg-line-soft/30" />
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
            <FifaPlayerCard
              name={player.fullName}
              position={player.preferredPosition}
              jerseyNumber={player.jerseyNumber}
              photoUrl={player.photoUrl}
              attributes={computeFifaAttributes(latest)}
            />
            {latest.notes && (
              <p className="mt-4 max-w-lg rounded-card border border-line-soft bg-white p-4 text-sm text-pitch/70">
                <span className="font-medium text-pitch">{t('parent.coachNotes')} </span>
                {latest.notes}
              </p>
            )}
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('player.statsPage.title')}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              <StatCard label={t('admin.matchStatsPage.goals')} value={totals.goals} size="sm" />
              <StatCard label={t('admin.matchStatsPage.assists')} value={totals.assists} size="sm" />
              <StatCard label={t('admin.matchStatsPage.tackles')} value={totals.tackles} size="sm" />
              <StatCard label={t('player.statsPage.matchesPlayed')} value={matchesPlayed} size="sm" />
              <StatCard label={t('player.statsPage.trainingSessions')} value={trainingSessions} size="sm" />
              <StatCard
                label={t('player.attendanceRate')}
                value={attendancePct ?? '—'}
                suffix={attendancePct !== null ? '%' : ''}
                size="sm"
              />
            </div>
          </div>

          {evaluations.length > 1 && (
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('parent.history')}</p>
              <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
                {evaluations.slice(1).map((ev) => {
                  const attrs = computeFifaAttributes(ev)
                  return (
                    <div key={ev.id} className="flex items-center justify-between p-4 text-sm">
                      <div>
                        <p className="font-medium text-pitch">{new Date(ev.date).toLocaleDateString()}</p>
                        <p className="text-pitch/60">{ev.notes || t('parent.noNotesRecorded')}</p>
                      </div>
                      <span className="stat-figure text-lg font-semibold text-grass">{attrs.overall}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {evaluations.length > 1 && (
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('player.progressPage.title')}</p>
              <ProgressChart evaluations={[...evaluations].reverse()} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
