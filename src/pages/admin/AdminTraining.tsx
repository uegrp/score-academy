import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { TrainingSession, Team, Coach } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'
import { StaggerContainer, StaggerItem } from '../../components/motion/Stagger'
import FloatingActionButton from '../../components/ui/FloatingActionButton'

type FormState = {
  teamId: string
  date: string
  time: string
  location: string
  coachId: string
  type: string
  status: TrainingSession['status']
}
const emptyForm: FormState = {
  teamId: '',
  date: '',
  time: '',
  location: '',
  coachId: '',
  type: 'Regular training',
  status: 'scheduled',
}

export default function AdminTraining() {
  const { t } = useTranslation()
  const { data: sessions, loading } = useCollection<TrainingSession>('trainingSessions')
  const { data: teams } = useCollection<Team>('teams')
  const { data: coaches } = useCollection<Coach>('coaches')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const sorted = [...sessions].sort((a, b) => a.date - b.date)
  const teamName = (id: string) => teams.find((tm) => tm.id === id)?.name ?? t('admin.trainingPageForm.unknownTeam')
  const coachName = (id: string) => coaches.find((c) => c.id === id)?.fullName ?? t('admin.trainingPageForm.unassigned')

  const statusLabel: Record<string, string> = {
    scheduled: t('common.scheduled'),
    completed: t('common.completed'),
    cancelled: t('common.cancelled'),
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setStatus(null)
    setModalOpen(true)
  }

  function openEdit(s: TrainingSession) {
    setEditingId(s.id)
    setForm({
      teamId: s.teamId,
      date: new Date(s.date).toISOString().slice(0, 10),
      time: s.time,
      location: s.location,
      coachId: s.coachId,
      type: s.type,
      status: s.status,
    })
    setStatus(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const payload = {
        teamId: form.teamId,
        date: new Date(form.date).getTime(),
        time: form.time,
        location: form.location.trim(),
        coachId: form.coachId,
        type: form.type.trim(),
        status: form.status,
      }
      if (editingId) {
        await updateDocById('trainingSessions', editingId, payload)
        setStatus({ type: 'success', message: t('admin.trainingPageForm.updated') })
      } else {
        await createDoc('trainingSessions', payload)
        setStatus({ type: 'success', message: t('admin.trainingPageForm.scheduled') })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.somethingWrong') })
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel(s: TrainingSession) {
    if (!confirm(t('admin.trainingPageForm.cancelConfirm'))) return
    try {
      await updateDocById('trainingSessions', s.id, { status: 'cancelled' })
      setStatus({ type: 'success', message: t('admin.trainingPageForm.cancelled') })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.trainingPageForm.failedCancel') })
    }
  }

  async function handleDelete(s: TrainingSession) {
    if (!confirm(t('admin.trainingPageForm.deleteConfirm'))) return
    try {
      await deleteDocById('trainingSessions', s.id)
      setStatus({ type: 'success', message: t('admin.trainingPageForm.deleted') })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.failedDelete') })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">{t('admin.trainingPage')}</h1>
        <Button size="sm" onClick={openAdd} disabled={teams.length === 0} className="hidden lg:inline-flex">
          + {t('admin.scheduleSession')}
        </Button>
      </div>
      <FloatingActionButton onClick={openAdd} label={t('admin.scheduleSession')} disabled={teams.length === 0} />

      <StatusBanner status={status} />
      {teams.length === 0 && (
        <p className="mt-3 text-sm text-warn">{t('admin.trainingPageForm.createTeamFirst')}</p>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : sorted.length === 0 ? (
          <EmptyState title={t('emptyStates.noTraining')} hint={t('emptyStates.noTrainingHint')} />
        ) : (
          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {sorted.map((s) => (
              <StaggerItem key={s.id} className="rounded-card border border-line-soft bg-white p-5 transition-shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-pitch">{teamName(s.teamId)}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      s.status === 'cancelled'
                        ? 'bg-danger/10 text-danger'
                        : s.status === 'completed'
                          ? 'bg-pitch/10 text-pitch/60'
                          : 'bg-grass/10 text-grass'
                    }`}
                  >
                    {statusLabel[s.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-pitch/60">
                  {new Date(s.date).toLocaleDateString()} · {s.time} · {s.location}
                </p>
                <p className="text-sm text-pitch/60">
                  {s.type} · {t('admin.trainingPageForm.coach')}: {coachName(s.coachId)}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(s)}>
                    {t('common.edit')}
                  </Button>
                  {s.status === 'scheduled' && (
                    <Button size="sm" variant="ghost" className="!text-pitch !border-line-soft" onClick={() => handleCancel(s)}>
                      {t('common.cancelled')}
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(s)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? t('common.edit') : t('admin.scheduleSession')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label={t('admin.trainingPageForm.team')}
            required
            value={form.teamId}
            onChange={(e) => setForm({ ...form, teamId: e.target.value })}
            placeholder={t('admin.trainingPageForm.selectTeam')}
            options={teams.map((tm) => ({ value: tm.id, label: tm.name }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('admin.trainingPageForm.date')}
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              label={t('admin.trainingPageForm.time')}
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
          <Input
            label={t('admin.trainingPageForm.location')}
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <Select
            label={t('admin.trainingPageForm.coach')}
            required
            value={form.coachId}
            onChange={(e) => setForm({ ...form, coachId: e.target.value })}
            placeholder={t('admin.trainingPageForm.selectCoach')}
            options={coaches.map((c) => ({ value: c.id, label: c.fullName }))}
          />
          <Input
            label={t('admin.trainingPageForm.trainingType')}
            required
            placeholder={t('admin.trainingPageForm.trainingTypePlaceholder')}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <Select
            label={t('admin.trainingPageForm.status')}
            required
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as TrainingSession['status'] })}
            options={[
              { value: 'scheduled', label: t('common.scheduled') },
              { value: 'completed', label: t('common.completed') },
              { value: 'cancelled', label: t('common.cancelled') },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? t('common.save') : t('admin.scheduleSession')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
