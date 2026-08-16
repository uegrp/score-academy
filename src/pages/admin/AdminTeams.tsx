import { useState } from 'react'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { Team, Coach, Player } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

type FormState = { name: string; ageGroup: string; coachId: string }
const emptyForm: FormState = { name: '', ageGroup: '', coachId: '' }

export default function AdminTeams() {
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

  function openEdit(t: Team) {
    setEditingId(t.id)
    setForm({ name: t.name, ageGroup: t.ageGroup, coachId: t.coachId ?? '' })
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
        playerIds: editingId ? (teams.find((t) => t.id === editingId)?.playerIds ?? []) : [],
      }
      if (editingId) {
        await updateDocById('teams', editingId, payload)
        setStatus({ type: 'success', message: 'Team updated.' })
      } else {
        await createDoc('teams', payload)
        setStatus({ type: 'success', message: 'Team created.' })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(t: Team) {
    if (!confirm(`Delete team "${t.name}"? Players assigned to it will keep their teamId reference until reassigned.`))
      return
    try {
      await deleteDocById('teams', t.id)
      setStatus({ type: 'success', message: `${t.name} deleted.` })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete.' })
    }
  }

  const coachName = (id?: string) => coaches.find((c) => c.id === id)?.fullName ?? 'Unassigned'
  const playerCount = (teamId: string) => players.filter((p) => p.teamId === teamId).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">Teams</h1>
        <Button size="sm" onClick={openAdd}>
          + Create team
        </Button>
      </div>

      <StatusBanner status={status} />

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : teams.length === 0 ? (
          <EmptyState title="No teams yet" hint="Create your first team, e.g. U9 or U13." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {teams.map((t) => (
              <div key={t.id} className="rounded-card border border-line-soft bg-white p-5">
                <p className="text-lg font-semibold text-pitch">{t.name}</p>
                <p className="mt-1 text-sm text-pitch/60">
                  {t.ageGroup} · Coach: {coachName(t.coachId)} · {playerCount(t.id)} players
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(t)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(t)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit team' : 'Create team'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Team name"
            required
            placeholder="e.g. U9"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Age group"
            required
            placeholder="e.g. Ages 8–9"
            value={form.ageGroup}
            onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
          />
          <Select
            label="Coach"
            value={form.coachId}
            onChange={(e) => setForm({ ...form, coachId: e.target.value })}
            placeholder="Unassigned"
            options={coaches.map((c) => ({ value: c.id, label: c.fullName }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Save changes' : 'Create team'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
