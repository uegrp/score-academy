import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, where } from '../../lib/collections'
import type { AttendanceRecord, AttendanceStatus, Player, Team, TrainingSession } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
]

export default function CoachAttendance() {
  const { appUser } = useAuth()
  const teamIds = appUser?.linkedTeamIds ?? []

  const { data: teams } = useCollection<Team>(
    'teams',
    teamIds.length ? [where('__name__', 'in', teamIds.slice(0, 10))] : [],
    [teamIds.join(',')]
  )
  const { data: sessions } = useCollection<TrainingSession>(
    'trainingSessions',
    teamIds.length ? [where('teamId', 'in', teamIds.slice(0, 10))] : [],
    [teamIds.join(',')]
  )

  const [sessionId, setSessionId] = useState('')
  const session = sessions.find((s) => s.id === sessionId)

  const { data: players } = useCollection<Player>(
    'players',
    session ? [where('teamId', '==', session.teamId)] : [],
    [session?.teamId]
  )
  const { data: existingAttendance } = useCollection<AttendanceRecord>(
    'attendance',
    sessionId ? [where('sessionId', '==', sessionId)] : [],
    [sessionId]
  )

  const [saving, setSaving] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const attendanceByPlayer = useMemo(
    () => Object.fromEntries(existingAttendance.map((a) => [a.playerId, a])),
    [existingAttendance]
  )

  const sortedSessions = [...sessions]
    .filter((s) => s.status !== 'cancelled')
    .sort((a, b) => b.date - a.date)

  async function markStatus(playerId: string, statusValue: AttendanceStatus) {
    if (!sessionId) return
    setSaving(playerId)
    setStatus(null)
    try {
      const existing = attendanceByPlayer[playerId]
      if (existing) {
        await updateDocById('attendance', existing.id, { status: statusValue, markedAt: Date.now() })
      } else {
        await createDoc('attendance', { sessionId, playerId, status: statusValue, markedAt: Date.now() })
      }
      setStatus({ type: 'success', message: 'Attendance saved.' })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save.' })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">Attendance</h1>
      <StatusBanner status={status} />

      {teamIds.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No teams assigned yet" />
        </div>
      ) : sortedSessions.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No training sessions to mark yet" hint="An admin schedules sessions for your teams." />
        </div>
      ) : (
        <>
          <div className="mt-5 max-w-sm">
            <Select
              label="Session"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Select a training session"
              options={sortedSessions.map((s) => ({
                value: s.id,
                label: `${teams.find((t) => t.id === s.teamId)?.name ?? 'Team'} · ${new Date(s.date).toLocaleDateString()} ${s.time}`,
              }))}
            />
          </div>

          {sessionId && (
            <div className="mt-6">
              {players.length === 0 ? (
                <EmptyState title="No players in this team yet" />
              ) : (
                <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
                  {players.map((p) => {
                    const current = attendanceByPlayer[p.id]?.status
                    return (
                      <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <p className="font-medium text-pitch">{p.fullName}</p>
                        <div className="flex gap-1.5">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => markStatus(p.id, opt.value)}
                              disabled={saving === p.id}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                                current === opt.value
                                  ? opt.value === 'present'
                                    ? 'border-grass bg-grass/10 text-grass'
                                    : opt.value === 'absent'
                                      ? 'border-danger bg-danger/10 text-danger'
                                      : 'border-warn bg-warn/10 text-warn'
                                  : 'border-line-soft text-pitch/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
