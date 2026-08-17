import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { Team, Coach, Player } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'
import { StaggerContainer, StaggerItem } from '../../components/motion/Stagger'
import FloatingActionButton from '../../components/ui/FloatingActionButton'

type FormState = { name: string; ageGroup: string; coachId: string }
const emptyForm: FormState = { name: '', ageGroup: '', coachId: '' }

export default function AdminTeams() {
  const { t } = useTranslation()
  const { data: teams, loading } = useCollection<Team>('teams')
  const { data: coaches } = useCollection<Coach>('coaches')
  const { data: players } = useCollection<Player>('players')

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

  function openEdit(tm: Team) {
    setEditingId(tm.id)
    setForm({ name: tm.name, ageGroup: tm.ageGroup, coachId: tm.coachId ?? '' })
    setStatus(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const payload = {
        name: form.name.trim(),
        ageGroup: form.ageGroup.trim(),
        coachId: form.coachId || undefined,
        playerIds: editingId ? (teams.find((tm) => tm.id === editingId)?.playerIds ?? []) : [],
      }
      if (editingId) {
        await updateDocById('teams', editingId, payload)
        setStatus({ type: 'success', message: t('admin.teamsPageForm.updated') })
      } else {
        await createDoc('teams', payload)
        setStatus({ type: 'success', message: t('admin.teamsPageForm.created') })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.somethingWrong') })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(tm: Team) {
    if (!confirm(t('admin.teamsPageForm.deleteConfirm', { name: tm.name }))) return
    try {
      await deleteDocById('teams', tm.id)
      setStatus({ type: 'success', message: t('admin.teamsPageForm.deleted', { name: tm.name }) })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.failedDelete') })
    }
  }

  const coachName = (id?: string) => coaches.find((c) => c.id === id)?.fullName ?? t('admin.teamsPageForm.unassigned')
  const playerCount = (teamId: string) => players.filter((p) => p.teamId === teamId).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">{t('admin.teamsPage')}</h1>
        <Button size="sm" onClick={openAdd} className="hidden lg:inline-flex">
          + {t('admin.createTeam')}
        </Button>
      </div>
      <FloatingActionButton onClick={openAdd} label={t('admin.createTeam')} />

      <StatusBanner status={status} />

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : teams.length === 0 ? (
          <EmptyState title={t('emptyStates.noTeams')} hint={t('emptyStates.noTeamsHint')} />
        ) : (
          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {teams.map((tm) => (
              <StaggerItem key={tm.id} className="rounded-card border border-line-soft bg-white p-5 transition-shadow hover:shadow-lg">
                <p className="text-lg font-semibold text-pitch">{tm.name}</p>
                <p className="mt-1 text-sm text-pitch/60">
                  {tm.ageGroup} · {t('admin.teamsPageForm.coachLabel')}: {coachName(tm.coachId)} · {playerCount(tm.id)}{' '}
                  {t('admin.teamsPageForm.playersCount')}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(tm)}>
                    {t('common.edit')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(tm)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('common.edit') : t('admin.createTeam')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('admin.teamsPageForm.teamName')}
            required
            placeholder={t('admin.teamsPageForm.teamNamePlaceholder')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label={t('admin.teamsPageForm.ageGroup')}
            required
            placeholder={t('admin.teamsPageForm.ageGroupPlaceholder')}
            value={form.ageGroup}
            onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
          />
          <Select
            label={t('admin.teamsPageForm.coachLabel')}
            value={form.coachId}
            onChange={(e) => setForm({ ...form, coachId: e.target.value })}
            placeholder={t('admin.teamsPageForm.unassigned')}
            options={coaches.map((c) => ({ value: c.id, label: c.fullName }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? t('common.save') : t('admin.createTeam')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
