import { useMemo, useState } from 'react'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { Player, Team } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

const LEVELS = ['Beginner', 'Developing', 'Intermediate', 'Advanced']
const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']

type FormState = {
  fullName: string
  dateOfBirth: string
  gender: 'male' | 'female'
  nationality: string
  preferredPosition: string
  currentLevel: string
  teamId: string
  status: Player['status']
  previousClub: string
  medicalNotes: string
  emergencyContactName: string
  emergencyContactPhone: string
  parentUserId: string
}

const emptyForm: FormState = {
  fullName: '',
  dateOfBirth: '',
  gender: 'male',
  nationality: '',
  preferredPosition: '',
  currentLevel: '',
  teamId: '',
  status: 'active',
  previousClub: '',
  medicalNotes: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  parentUserId: '',
}

export default function AdminPlayers() {
  const { data: players, loading } = useCollection<Player>('players')
  const { data: teams } = useCollection<Team>('teams')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Player['status']>('all')
  const [teamFilter, setTeamFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const teamById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t.name])), [teams])

  const filtered = players.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (teamFilter !== 'all' && p.teamId !== teamFilter) return false
    if (search && !p.fullName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setStatus(null)
    setModalOpen(true)
  }

  function openEdit(p: Player) {
    setEditingId(p.id)
    setForm({
      fullName: p.fullName,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      nationality: p.nationality,
      preferredPosition: p.preferredPosition,
      currentLevel: p.currentLevel,
      teamId: p.teamId ?? '',
      status: p.status,
      previousClub: p.previousClub ?? '',
      medicalNotes: p.medicalNotes ?? '',
      emergencyContactName: p.emergencyContact?.name ?? '',
      emergencyContactPhone: p.emergencyContact?.phone ?? '',
      parentUserId: p.parentUserId ?? '',
    })
    setStatus(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const payload: Omit<Player, 'id'> = {
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        nationality: form.nationality.trim(),
        preferredPosition: form.preferredPosition,
        currentLevel: form.currentLevel,
        teamId: form.teamId || undefined,
        status: form.status,
        previousClub: form.previousClub.trim() || undefined,
        medicalNotes: form.medicalNotes.trim() || undefined,
        emergencyContact: {
          name: form.emergencyContactName.trim(),
          phone: form.emergencyContactPhone.trim(),
        },
        parentUserId: form.parentUserId.trim(),
        joiningDate: editingId ? (players.find((p) => p.id === editingId)?.joiningDate ?? Date.now()) : Date.now(),
      }

      if (editingId) {
        await updateDocById('players', editingId, payload)
        setStatus({ type: 'success', message: 'Player updated.' })
      } else {
        await createDoc('players', payload)
        setStatus({ type: 'success', message: 'Player added.' })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive(p: Player) {
    if (!confirm(`Archive ${p.fullName}? They'll be hidden from active lists but not deleted.`)) return
    try {
      await updateDocById('players', p.id, { status: 'archived' })
      setStatus({ type: 'success', message: `${p.fullName} archived.` })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to archive.' })
    }
  }

  async function handleDelete(p: Player) {
    if (!confirm(`Permanently delete ${p.fullName}? This cannot be undone.`)) return
    try {
      await deleteDocById('players', p.id)
      setStatus({ type: 'success', message: `${p.fullName} deleted.` })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete.' })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">Players</h1>
        <Button size="sm" onClick={openAdd}>
          + Add player
        </Button>
      </div>

      <StatusBanner status={status} />

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-xl border border-line-soft bg-white px-3.5 py-2.5 text-pitch outline-none focus:border-grass"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-xl border border-line-soft bg-white px-3.5 py-2.5 text-pitch outline-none focus:border-grass"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded-xl border border-line-soft bg-white px-3.5 py-2.5 text-pitch outline-none focus:border-grass"
        >
          <option value="all">All teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={players.length === 0 ? 'No players yet' : 'No players match your filters'}
            hint={players.length === 0 ? 'Add your first player or approve a pending registration.' : undefined}
          />
        ) : (
          <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {filtered.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-pitch">{p.fullName}</p>
                  <p className="text-sm text-pitch/60">
                    {p.preferredPosition || '—'} · {teamById[p.teamId ?? ''] ?? 'No team'} ·{' '}
                    <span
                      className={
                        p.status === 'active' ? 'text-grass' : p.status === 'pending' ? 'text-warn' : 'text-pitch/40'
                      }
                    >
                      {p.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  {p.status !== 'archived' && (
                    <Button size="sm" variant="ghost" className="!text-pitch !border-line-soft" onClick={() => handleArchive(p)}>
                      Archive
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit player' : 'Add player'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date of birth"
              type="date"
              required
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
            <Select
              label="Gender"
              required
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
          </div>
          <Input
            label="Nationality"
            required
            value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Preferred position"
              required
              value={form.preferredPosition}
              onChange={(e) => setForm({ ...form, preferredPosition: e.target.value })}
              placeholder="Select position"
              options={POSITIONS.map((p) => ({ value: p, label: p }))}
            />
            <Select
              label="Current level"
              required
              value={form.currentLevel}
              onChange={(e) => setForm({ ...form, currentLevel: e.target.value })}
              placeholder="Select level"
              options={LEVELS.map((l) => ({ value: l, label: l }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Team"
              value={form.teamId}
              onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              placeholder="No team yet"
              options={teams.map((t) => ({ value: t.id, label: t.name }))}
            />
            <Select
              label="Status"
              required
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Player['status'] })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>
          <Input
            label="Previous club (optional)"
            value={form.previousClub}
            onChange={(e) => setForm({ ...form, previousClub: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Emergency contact name"
              required
              value={form.emergencyContactName}
              onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
            />
            <Input
              label="Emergency contact phone"
              required
              value={form.emergencyContactPhone}
              onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
            />
          </div>
          <Input
            label="Parent account UID (optional — links this player to a parent's login)"
            value={form.parentUserId}
            onChange={(e) => setForm({ ...form, parentUserId: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Save changes' : 'Add player'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
