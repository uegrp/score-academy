import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { Coach, Team } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

type FormState = { fullName: string; specialty: string; userId: string; assignedTeamIds: string[] }
const emptyForm: FormState = { fullName: '', specialty: '', userId: '', assignedTeamIds: [] }

export default function AdminCoaches() {
  const { t } = useTranslation()
  const { data: coaches, loading } = useCollection<Coach>('coaches')
  const { data: teams } = useCollection<Team>('teams')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setStatus(null)
    setModalOpen(true)
  }

  function openEdit(c: Coach) {
    setEditingId(c.id)
    setForm({
      fullName: c.fullName,
      specialty: c.specialty ?? '',
      userId: c.userId ?? '',
      assignedTeamIds: c.assignedTeamIds ?? [],
    })
    setStatus(null)
    setModalOpen(true)
  }

  function toggleTeam(teamId: string) {
    setForm((f) => ({
      ...f,
      assignedTeamIds: f.assignedTeamIds.includes(teamId)
        ? f.assignedTeamIds.filter((id) => id !== teamId)
        : [...f.assignedTeamIds, teamId],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const payload = {
        fullName: form.fullName.trim(),
        specialty: form.specialty.trim() || undefined,
        userId: form.userId.trim(),
        assignedTeamIds: form.assignedTeamIds,
      }
      if (editingId) {
        await updateDocById('coaches', editingId, payload)
        // Keep the coach's linked user doc in sync so security rules (which
        // read linkedTeamIds from /users/{uid}) reflect the new assignment.
        if (payload.userId) {
          await updateDocById('users', payload.userId, { linkedTeamIds: payload.assignedTeamIds }).catch(() => {})
        }
        setStatus({ type: 'success', message: t('admin.coachesPageForm.updated') })
      } else {
        await createDoc('coaches', payload)
        if (payload.userId) {
          await updateDocById('users', payload.userId, { linkedTeamIds: payload.assignedTeamIds }).catch(() => {})
        }
        setStatus({ type: 'success', message: t('admin.coachesPageForm.added') })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.somethingWrong') })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(c: Coach) {
    if (!confirm(t('admin.coachesPageForm.removeConfirm', { name: c.fullName }))) return
    try {
      await deleteDocById('coaches', c.id)
      setStatus({ type: 'success', message: t('admin.coachesPageForm.removed', { name: c.fullName }) })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.failedDelete') })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">{t('admin.coachesPage')}</h1>
        <Button size="sm" onClick={openAdd}>
          + {t('admin.addCoach')}
        </Button>
      </div>

      <StatusBanner status={status} />

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : coaches.length === 0 ? (
          <EmptyState title={t('emptyStates.noCoaches')} hint={t('emptyStates.noCoachesHint')} />
        ) : (
          <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {coaches.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-pitch">{c.fullName}</p>
                  <p className="text-sm text-pitch/60">
                    {c.specialty || t('admin.coachesPageForm.generalCoaching')} ·{' '}
                    {c.assignedTeamIds?.length
                      ? teams
                          .filter((tm) => c.assignedTeamIds.includes(tm.id))
                          .map((tm) => tm.name)
                          .join(', ')
                      : t('admin.coachesPageForm.noTeamsAssignedShort')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>
                    {t('common.edit')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(c)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('common.edit') : t('admin.addCoach')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('admin.playersPage.fullName')}
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label={t('admin.coachesPageForm.specialty')}
            placeholder={t('admin.coachesPageForm.specialtyPlaceholder')}
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          />
          <Input
            label={t('admin.coachesPageForm.linkedUid')}
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          />
          <div>
            <p className="text-sm font-medium text-pitch/80">{t('admin.coachesPageForm.assignedTeams')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {teams.length === 0 && <p className="text-sm text-pitch/50">{t('admin.coachesPageForm.createTeamFirst')}</p>}
              {teams.map((tm) => (
                <button
                  type="button"
                  key={tm.id}
                  onClick={() => toggleTeam(tm.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    form.assignedTeamIds.includes(tm.id)
                      ? 'border-grass bg-grass/10 text-grass'
                      : 'border-line-soft text-pitch/60'
                  }`}
                >
                  {tm.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? t('common.save') : t('admin.addCoach')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
