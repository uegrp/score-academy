import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, orderBy } from '../../lib/collections'
import type { Registration, Player } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import StatusBanner from '../../components/ui/StatusBanner'
import { StaggerContainer, StaggerItem } from '../../components/motion/Stagger'

export default function AdminRegistrations() {
  const { t } = useTranslation()
  const { data: registrations, loading } = useCollection<Registration>('registrations', [
    orderBy('submittedAt', 'desc'),
  ])
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const pending = registrations.filter((r) => r.status === 'pending')
  const decided = registrations.filter((r) => r.status !== 'pending')

  const statusLabel: Record<string, string> = {
    approved: t('common.approved'),
    rejected: t('common.rejected'),
  }

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
        parentUserIds: [], // Link once the parent creates/confirms their login account.
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
      setStatus({ type: 'success', message: t('admin.registrationsPageForm.approved', { name: r.player.fullName }) })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.registrationsPageForm.failedApprove') })
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(r: Registration) {
    if (!confirm(t('admin.registrationsPageForm.rejectConfirm', { name: r.player.fullName }))) return
    setBusyId(r.id)
    setStatus(null)
    try {
      await updateDocById('registrations', r.id, { status: 'rejected' })
      setStatus({ type: 'success', message: t('admin.registrationsPageForm.rejected') })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.registrationsPageForm.failedReject') })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('admin.registrationsPage')}</h1>
      <StatusBanner status={status} />

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('admin.pendingReview')}</h2>
        {loading ? (
          <div className="mt-3 h-32 animate-pulse rounded-card bg-line-soft/30" />
        ) : pending.length === 0 ? (
          <div className="mt-3">
            <EmptyState title={t('emptyStates.noRegistrations')} hint={t('emptyStates.noRegistrationsHint')} />
          </div>
        ) : (
          <StaggerContainer className="mt-3 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {pending.map((r) => (
              <StaggerItem key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-pitch">{r.player.fullName}</p>
                  <p className="text-sm text-pitch/60">
                    {r.player.preferredPosition} · {r.player.currentLevel} · {t('admin.registrationsPageForm.dob')}{' '}
                    {r.player.dateOfBirth}
                  </p>
                  <p className="text-sm text-pitch/60">
                    {t('admin.registrationsPageForm.parentLabel')}: {r.parentName} · {r.parentPhone} · {r.parentEmail}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" loading={busyId === r.id} onClick={() => handleApprove(r)}>
                    {t('admin.approve')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleReject(r)} disabled={busyId === r.id}>
                    {t('admin.reject')}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('admin.decided')}</h2>
        {decided.length === 0 ? (
          <p className="mt-3 text-sm text-pitch/50">{t('admin.registrationsPageForm.noDecisions')}</p>
        ) : (
          <StaggerContainer className="mt-3 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {decided.map((r) => (
              <StaggerItem key={r.id} className="flex items-center justify-between p-4">
                <p className="font-medium text-pitch">{r.player.fullName}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    r.status === 'approved' ? 'bg-grass/10 text-grass' : 'bg-danger/10 text-danger'
                  }`}
                >
                  {statusLabel[r.status]}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>
    </div>
  )
}
