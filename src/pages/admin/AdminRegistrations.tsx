import { useState } from 'react'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, orderBy } from '../../lib/collections'
import type { Registration, Player } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import StatusBanner from '../../components/ui/StatusBanner'

export default function AdminRegistrations() {
  const { data: registrations, loading } = useCollection<Registration>('registrations', [
    orderBy('submittedAt', 'desc'),
  ])
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const pending = registrations.filter((r) => r.status === 'pending')
  const decided = registrations.filter((r) => r.status !== 'pending')

  async function handleApprove(r: Registration) {
    setBusyId(r.id)
    setStatus(null)
    try {
      const playerPayload: Omit<Player, 'id'> = {
        fullName: r.player.fullName,
        dateOfBirth: r.player.dateOfBirth,
        gender: r.player.gender,
        nationality: r.player.nationality,
        preferredPosition: r.player.preferredPosition,
        currentLevel: r.player.currentLevel,
        status: 'active',
        parentUserId: '', // Link once the parent creates/confirms their login account.
        previousClub: r.previousClub,
        experience: r.experience,
        medicalNotes: r.medicalNotes,
        emergencyContact: {
          name: r.emergencyContactName,
          phone: r.emergencyContactPhone,
        },
        joiningDate: Date.now(),
      }
      await createDoc('players', playerPayload)
      await updateDocById('registrations', r.id, { status: 'approved' })
      setStatus({ type: 'success', message: `${r.player.fullName} approved and added as an active player.` })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to approve.' })
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(r: Registration) {
    if (!confirm(`Reject the application for ${r.player.fullName}?`)) return
    setBusyId(r.id)
    setStatus(null)
    try {
      await updateDocById('registrations', r.id, { status: 'rejected' })
      setStatus({ type: 'success', message: 'Application rejected.' })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to reject.' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">Registrations</h1>
      <StatusBanner status={status} />

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">Pending review</h2>
        {loading ? (
          <div className="mt-3 h-32 animate-pulse rounded-card bg-line-soft/30" />
        ) : pending.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No pending registrations" hint="New player applications will appear here for review." />
          </div>
        ) : (
          <div className="mt-3 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {pending.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-pitch">{r.player.fullName}</p>
                  <p className="text-sm text-pitch/60">
                    {r.player.preferredPosition} · {r.player.currentLevel} · DOB {r.player.dateOfBirth}
                  </p>
                  <p className="text-sm text-pitch/60">
                    Parent: {r.parentName} · {r.parentPhone} · {r.parentEmail}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" loading={busyId === r.id} onClick={() => handleApprove(r)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleReject(r)} disabled={busyId === r.id}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">Decided</h2>
        {decided.length === 0 ? (
          <p className="mt-3 text-sm text-pitch/50">No decisions made yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {decided.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4">
                <p className="font-medium text-pitch">{r.player.fullName}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    r.status === 'approved' ? 'bg-grass/10 text-grass' : 'bg-danger/10 text-danger'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
