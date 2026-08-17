import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { Player, Team } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

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
  const { t } = useTranslation()
  const { data: players, loading } = useCollection<Player>('players')
  const { data: teams } = useCollection<Team>('teams')

  const LEVELS = [
    t('admin.playersPage.levelBeginner'),
    t('admin.playersPage.levelDeveloping'),
    t('admin.playersPage.levelIntermediate'),
    t('admin.playersPage.levelAdvanced'),
  ]
  const POSITIONS = [t('auth.goalkeeper'), t('auth.defender'), t('auth.midfielder'), t('auth.forward')]

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Player['status']>('all')
  const [teamFilter, setTeamFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const teamById = useMemo(() => Object.fromEntries(teams.map((tm) => [tm.id, tm.name])), [teams])

  const filtered = players.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (teamFilter !== 'all' && p.teamId !== teamFilter) return false
    if (search && !p.fullName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const statusLabel: Record<string, string> = {
    active: t('common.active'),
    pending: t('common.pending'),
    archived: t('common.archived'),
  }

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
        setStatus({ type: 'success', message: t('admin.playersPage.updated') })
      } else {
        await createDoc('players', payload)
        setStatus({ type: 'success', message: t('admin.playersPage.added') })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.somethingWrong') })
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive(p: Player) {
    if (!confirm(t('admin.playersPage.archiveConfirm', { name: p.fullName }))) return
    try {
      await updateDocById('players', p.id, { status: 'archived' })
      setStatus({ type: 'success', message: t('admin.playersPage.archived', { name: p.fullName }) })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.failedArchive') })
    }
  }

  async function handleDelete(p: Player) {
    if (!confirm(t('admin.playersPage.deleteConfirm', { name: p.fullName }))) return
    try {
      await deleteDocById('players', p.id)
      setStatus({ type: 'success', message: t('admin.playersPage.deleted', { name: p.fullName }) })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.failedDelete') })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">{t('admin.players')}</h1>
        <Button size="sm" onClick={openAdd}>
          + {t('admin.addPlayer')}
        </Button>
      </div>

      <StatusBanner status={status} />

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder={t('admin.playersPage.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-xl border border-line-soft bg-white px-3.5 py-2.5 text-pitch outline-none focus:border-grass"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-xl border border-line-soft bg-white px-3.5 py-2.5 text-pitch outline-none focus:border-grass"
        >
          <option value="all">{t('admin.playersPage.allStatuses')}</option>
          <option value="active">{t('common.active')}</option>
          <option value="pending">{t('common.pending')}</option>
          <option value="archived">{t('common.archived')}</option>
        </select>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded-xl border border-line-soft bg-white px-3.5 py-2.5 text-pitch outline-none focus:border-grass"
        >
          <option value="all">{t('admin.playersPage.allTeams')}</option>
          {teams.map((tm) => (
            <option key={tm.id} value={tm.id}>
              {tm.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={players.length === 0 ? t('emptyStates.noPlayers') : t('admin.playersPage.noPlayersMatch')}
            hint={players.length === 0 ? t('emptyStates.noPlayersHint') : undefined}
          />
        ) : (
          <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {filtered.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-pitch">{p.fullName}</p>
                  <p className="text-sm text-pitch/60">
                    {p.preferredPosition || '—'} · {teamById[p.teamId ?? ''] ?? t('admin.playersPage.noTeam')} ·{' '}
                    <span
                      className={
                        p.status === 'active' ? 'text-grass' : p.status === 'pending' ? 'text-warn' : 'text-pitch/40'
                      }
                    >
                      {statusLabel[p.status]}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>
                    {t('common.edit')}
                  </Button>
                  {p.status !== 'archived' && (
                    <Button size="sm" variant="ghost" className="!text-pitch !border-line-soft" onClick={() => handleArchive(p)}>
                      {t('common.archive')}
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('admin.editPlayer') : t('admin.addPlayer')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('admin.playersPage.fullName')}
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('admin.playersPage.dateOfBirth')}
              type="date"
              required
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
            <Select
              label={t('admin.playersPage.gender')}
              required
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}
              options={[
                { value: 'male', label: t('admin.playersPage.male') },
                { value: 'female', label: t('admin.playersPage.female') },
              ]}
            />
          </div>
          <Input
            label={t('admin.playersPage.nationality')}
            required
            value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('admin.playersPage.preferredPosition')}
              required
              value={form.preferredPosition}
              onChange={(e) => setForm({ ...form, preferredPosition: e.target.value })}
              placeholder={t('admin.playersPage.selectPosition')}
              options={POSITIONS.map((p) => ({ value: p, label: p }))}
            />
            <Select
              label={t('admin.playersPage.currentLevel')}
              required
              value={form.currentLevel}
              onChange={(e) => setForm({ ...form, currentLevel: e.target.value })}
              placeholder={t('admin.playersPage.selectLevel')}
              options={LEVELS.map((l) => ({ value: l, label: l }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('admin.playersPage.team')}
              value={form.teamId}
              onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              placeholder={t('admin.playersPage.noTeamYet')}
              options={teams.map((tm) => ({ value: tm.id, label: tm.name }))}
            />
            <Select
              label={t('admin.playersPage.status')}
              required
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Player['status'] })}
              options={[
                { value: 'active', label: t('common.active') },
                { value: 'pending', label: t('common.pending') },
                { value: 'archived', label: t('common.archived') },
              ]}
            />
          </div>
          <Input
            label={t('admin.playersPage.previousClub')}
            value={form.previousClub}
            onChange={(e) => setForm({ ...form, previousClub: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('admin.playersPage.emergencyContactName')}
              required
              value={form.emergencyContactName}
              onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
            />
            <Input
              label={t('admin.playersPage.emergencyContactPhone')}
              required
              value={form.emergencyContactPhone}
              onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
            />
          </div>
          <Input
            label={t('admin.playersPage.parentUid')}
            value={form.parentUserId}
            onChange={(e) => setForm({ ...form, parentUserId: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? t('common.save') : t('admin.addPlayer')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
