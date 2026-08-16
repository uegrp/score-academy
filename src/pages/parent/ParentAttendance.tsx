import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import type { AttendanceRecord, Player, TrainingSession } from '../../types'
import { where } from '../../lib/collections'
import EmptyState from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormField'

export default function ParentAttendance() {
  const { appUser } = useAuth()
  const { data: players } = useCollection<Player>('players', appUser ? [where('parentUserId', '==', appUser.uid)] : [])
  const [playerId, setPlayerId] = useState('')

  const activePlayer = players.find((p) => p.id === playerId) ?? players[0]

  const { data: records, loading } = useCollection<AttendanceRecord>(
    'attendance',
    activePlayer ? [where('playerId', '==', activePlayer.id)] : [],
    [activePlayer?.id]
  )
  const { data: sessions } = useCollection<TrainingSession>('trainingSessions')

  const sessionById = Object.fromEntries(sessions.map((s) => [s.id, s]))
  const sorted = [...records].sort((a, b) => b.markedAt - a.markedAt)

  const total = records.length
  const present = records.filter((r) => r.status === 'present').length
  const late = records.filter((r) => r.status === 'late').length
  const absent = records.filter((r) => r.status === 'absent').length
  const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0

  const statusColor: Record<string, string> = {
    present: 'text-grass',
    late: 'text-warn',
    absent: 'text-danger',
    excused: 'text-pitch/50',
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">Attendance</h1>

      {players.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No player linked yet" />
        </div>
      ) : (
        <>
          {players.length > 1 && (
            <div className="mt-5 max-w-xs">
              <Select
                label="Player"
                value={playerId || players[0].id}
                onChange={(e) => setPlayerId(e.target.value)}
                options={players.map((p) => ({ value: p.id, label: p.fullName }))}
              />
            </div>
          )}

          {loading ? (
            <div className="mt-6 h-32 animate-pulse rounded-card bg-line-soft/30" />
          ) : total === 0 ? (
            <div className="mt-6">
              <EmptyState title="No attendance recorded yet" />
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Attendance rate" value={`${percentage}%`} />
                <StatCard label="Total sessions" value={total} />
                <StatCard label="Present" value={present} />
                <StatCard label="Absent" value={absent} />
              </div>

              <div className="mt-6 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
                {sorted.map((r) => {
                  const session = sessionById[r.sessionId]
                  return (
                    <div key={r.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium text-pitch">{session?.type ?? 'Training session'}</p>
                        <p className="text-sm text-pitch/60">
                          {session ? new Date(session.date).toLocaleDateString() : ''} {session?.time}
                        </p>
                      </div>
                      <span className={`text-sm font-medium capitalize ${statusColor[r.status]}`}>{r.status}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
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
