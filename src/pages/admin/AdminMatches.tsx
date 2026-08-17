import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { Match, Team } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'
import { StaggerContainer, StaggerItem } from '../../components/motion/Stagger'
import FloatingActionButton from '../../components/ui/FloatingActionButton'

type FormState = {
  teamId: string
  opponent: string
  date: string
  kickoffTime: string
  location: string
  isHome: 'true' | 'false'
  scoreFor: string
  scoreAgainst: string
}
const emptyForm: FormState = {
  teamId: '',
  opponent: '',
  date: '',
  kickoffTime: '',
  location: '',
  isHome: 'true',
  scoreFor: '',
  scoreAgainst: '',
}

export default function AdminMatches() {
  const { t } = useTranslation()
  const { data: matches, loading } = useCollection<Match>('matches')
  const { data: teams } = useCollection<Team>('teams')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const sorted = [...matches].sort((a, b) => a.date - b.date)
  const teamName = (id: string) => teams.find((tm) => tm.id === id)?.name ?? t('admin.matchesPageForm.unknownTeam')

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setStatus(null)
    setModalOpen(true)
  }

  function openEdit(m: Match) {
    setEditingId(m.id)
    setForm({
      teamId: m.teamId,
      opponent: m.opponent,
      date: new Date(m.date).toISOString().slice(0, 10),
      kickoffTime: m.kickoffTime,
      location: m.location,
      isHome: m.isHome ? 'true' : 'false',
      scoreFor: m.result ? String(m.result.scoreFor) : '',
      scoreAgainst: m.result ? String(m.result.scoreAgainst) : '',
    })
    setStatus(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const hasResult = form.scoreFor !== '' && form.scoreAgainst !== ''
      const payload = {
        teamId: form.teamId,
        opponent: form.opponent.trim(),
        date: new Date(form.date).getTime(),
        kickoffTime: form.kickoffTime,
        location: form.location.trim(),
        isHome: form.isHome === 'true',
        result: hasResult
          ? { scoreFor: Number(form.scoreFor), scoreAgainst: Number(form.scoreAgainst) }
          : undefined,
      }
      if (editingId) {
        await updateDocById('matches', editingId, payload)
        setStatus({ type: 'success', message: t('admin.matchesPageForm.updated') })
      } else {
        await createDoc('matches', payload)
        setStatus({ type: 'success', message: t('admin.matchesPageForm.created') })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.somethingWrong') })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(m: Match) {
    if (!confirm(t('admin.matchesPageForm.deleteConfirm', { opponent: m.opponent }))) return
    try {
      await deleteDocById('matches', m.id)
      setStatus({ type: 'success', message: t('admin.matchesPageForm.deleted') })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.failedDelete') })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">{t('admin.matchesPage')}</h1>
        <Button size="sm" onClick={openAdd} disabled={teams.length === 0} className="hidden lg:inline-flex">
          + {t('admin.addMatch')}
        </Button>
      </div>
      <FloatingActionButton onClick={openAdd} label={t('admin.addMatch')} disabled={teams.length === 0} />

      <StatusBanner status={status} />
      {teams.length === 0 && <p className="mt-3 text-sm text-warn">{t('admin.matchesPageForm.createTeamFirst')}</p>}

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : sorted.length === 0 ? (
          <EmptyState title={t('emptyStates.noMatches')} hint={t('emptyStates.noMatchesHint')} />
        ) : (
          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {sorted.map((m) => (
              <StaggerItem key={m.id} className="rounded-card border border-line-soft bg-white p-5 transition-shadow hover:shadow-lg">
                <p className="font-semibold text-pitch">
                  {teamName(m.teamId)} {t('admin.matchesPageForm.vs')} {m.opponent}
                </p>
                <p className="mt-1 text-sm text-pitch/60">
                  {new Date(m.date).toLocaleDateString()} · {m.kickoffTime} ·{' '}
                  {m.isHome ? t('matchesPage.home') : t('matchesPage.away')} · {m.location}
                </p>
                {m.result ? (
                  <p className="mt-2 text-lg font-semibold text-grass">
                    {m.result.scoreFor} – {m.result.scoreAgainst}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-pitch/40">{t('admin.matchesPageForm.resultNotEntered')}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>
                    {t('common.edit')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(m)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('common.edit') : t('admin.addMatch')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label={t('admin.matchesPageForm.team')}
            required
            value={form.teamId}
            onChange={(e) => setForm({ ...form, teamId: e.target.value })}
            placeholder={t('admin.matchesPageForm.selectTeam')}
            options={teams.map((tm) => ({ value: tm.id, label: tm.name }))}
          />
          <Input
            label={t('admin.matchesPageForm.opponent')}
            required
            value={form.opponent}
            onChange={(e) => setForm({ ...form, opponent: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('admin.matchesPageForm.date')}
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              label={t('admin.matchesPageForm.kickoffTime')}
              type="time"
              required
              value={form.kickoffTime}
              onChange={(e) => setForm({ ...form, kickoffTime: e.target.value })}
            />
          </div>
          <Input
            label={t('admin.matchesPageForm.location')}
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <Select
            label={t('admin.matchesPageForm.homeOrAway')}
            required
            value={form.isHome}
            onChange={(e) => setForm({ ...form, isHome: e.target.value as 'true' | 'false' })}
            options={[
              { value: 'true', label: t('matchesPage.home') },
              { value: 'false', label: t('matchesPage.away') },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('admin.matchesPageForm.scoreFor')}
              type="number"
              min={0}
              value={form.scoreFor}
              onChange={(e) => setForm({ ...form, scoreFor: e.target.value })}
            />
            <Input
              label={t('admin.matchesPageForm.scoreAgainst')}
              type="number"
              min={0}
              value={form.scoreAgainst}
              onChange={(e) => setForm({ ...form, scoreAgainst: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? t('common.save') : t('admin.addMatch')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
