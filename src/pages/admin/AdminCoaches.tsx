import { useState } from 'react'
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
        setStatus({ type: 'success', message: 'Coach updated.' })
      } else {
        await createDoc('coaches', payload)
        if (payload.userId) {
          await updateDocById('users', payload.userId, { linkedTeamIds: payload.assignedTeamIds }).catch(() => {})
        }
        setStatus({ type: 'success', message: 'Coach added.' })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(c: Coach) {
    if (!confirm(`Remove coach ${c.fullName}?`)) return
    try {
      await deleteDocById('coaches', c.id)
      setStatus({ type: 'success', message: `${c.fullName} removed.` })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete.' })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">Coaches</h1>
        <Button size="sm" onClick={openAdd}>
          + Add coach
        </Button>
      </div>

      <StatusBanner status={status} />

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : coaches.length === 0 ? (
          <EmptyState title="No coaches yet" hint="Add a coach and assign them to teams." />
        ) : (
          <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {coaches.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-pitch">{c.fullName}</p>
                  <p className="text-sm text-pitch/60">
                    {c.specialty || 'General coaching'} ·{' '}
                    {c.assignedTeamIds?.length
                      ? teams
                          .filter((t) => c.assignedTeamIds.includes(t.id))
                          .map((t) => t.name)
                          .join(', ')
                      : 'No teams assigned'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(c)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit coach' : 'Add coach'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label="Specialty (optional)"
            placeholder="e.g. Goalkeeping, fitness"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          />
          <Input
            label="Linked account UID (from Firebase Auth, so they can log in as coach)"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          />
          <div>
            <p className="text-sm font-medium text-pitch/80">Assigned teams</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {teams.length === 0 && <p className="text-sm text-pitch/50">Create a team first.</p>}
              {teams.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => toggleTeam(t.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    form.assignedTeamIds.includes(t.id)
                      ? 'border-grass bg-grass/10 text-grass'
                      : 'border-line-soft text-pitch/60'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Save changes' : 'Add coach'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
