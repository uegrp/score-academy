import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { where } from '../../lib/collections'
import type { Player, AttendanceRecord, TrainingSession } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'

export default function PlayerAttendance() {
  const { t } = useTranslation()
  const { appUser } = useAuth()

  const { data: players } = useCollection<Player>('players', appUser ? [where('playerUserId', '==', appUser.uid)] : [])
  const player = players[0]

  const { data: records, loading } = useCollection<AttendanceRecord>(
    'attendance',
    player ? [where('playerId', '==', player.id)] : [],
    [player?.id]
  )
  const { data: sessions } = useCollection<TrainingSession>('trainingSessions')
  const sessionById = Object.fromEntries(sessions.map((s) => [s.id, s]))

  const sorted = [...records].sort((a, b) => b.markedAt - a.markedAt)
  const total = records.length
  const present = records.filter((r) => r.status === 'present').length
  const absent = records.filter((r) => r.status === 'absent').length
  const late = records.filter((r) => r.status === 'late').length
  const pct = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0

  const statusColor: Record<string, string> = {
    present: 'text-grass',
    late: 'text-warn',
    absent: 'text-danger',
    excused: 'text-pitch/50',
  }
  const statusLabel: Record<string, string> = {
    present: t('common.present'),
    late: t('common.late'),
    absent: t('common.absent'),
    excused: t('common.excused'),
  }

  if (!player) {
    return (
      <div>
        <h1 className="text-3xl text-pitch">{t('parent.attendance')}</h1>
        <div className="mt-6">
          <EmptyState title={t('player.notLinkedYet')} hint={t('player.notLinkedYetHint')} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">{t('parent.attendance')}</h1>
        <Link to="/player/checkin">
          <Button size="sm">{t('parent.checkIn.title')}</Button>
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 h-32 animate-pulse rounded-card bg-line-soft/30" />
      ) : total === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('emptyStates.noAttendance')} />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label={t('parent.attendanceRate')} value={`${pct}%`} />
            <StatCard label={t('parent.totalSessions')} value={total} />
            <StatCard label={t('parent.present')} value={present} />
            <StatCard label={t('parent.absent')} value={absent} />
          </div>

          <div className="mt-6 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {sorted.map((r) => {
              const session = sessionById[r.sessionId]
              return (
                <div key={r.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-pitch">{session?.type ?? t('coach.session')}</p>
                    <p className="text-sm text-pitch/60">
                      {session ? new Date(session.date).toLocaleDateString() : ''} {session?.time}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-line-soft bg-white p-4">
      <p className="stat-figure text-2xl text-pitch">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-pitch/60">{label}</p>
    </div>
  )
}
