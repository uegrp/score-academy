import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, deleteDocById, where } from '../../lib/collections'
import { dayStart } from '../../lib/dates'
import type { Player, DailyTask } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

export default function CoachTasks() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const teamIds = appUser?.linkedTeamIds ?? []

  const { data: players } = useCollection<Player>(
    'players',
    teamIds.length ? [where('teamId', 'in', teamIds.slice(0, 10))] : [],
    [teamIds.join(',')]
  )

  const [playerId, setPlayerId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const { data: tasks, loading } = useCollection<DailyTask>(
    'dailyTasks',
    playerId ? [where('playerId', '==', playerId)] : [],
    [playerId]
  )
  const sorted = [...tasks].sort((a, b) => b.date - a.date)

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!playerId || !title.trim() || !appUser) return
    setSaving(true)
    setStatus(null)
    try {
      await createDoc('dailyTasks', {
        playerId,
        title: title.trim(),
        date: dayStart(new Date(date).getTime()),
        completed: false,
        assignedBy: appUser.uid,
        createdAt: Date.now(),
      })
      setTitle('')
      setStatus({ type: 'success', message: t('coach.tasksPage.assigned') })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('coach.failedToSave') })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(task: DailyTask) {
    if (!confirm(t('coach.tasksPage.deleteConfirm'))) return
    try {
      await deleteDocById('dailyTasks', task.id)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.failedDelete') })
    }
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('coach.tasksPage.title')}</h1>
      <StatusBanner status={status} />

      {teamIds.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('emptyStates.noTeamsAssignedYet')} />
        </div>
      ) : players.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('emptyStates.noPlayersToEvaluate')} />
        </div>
      ) : (
        <>
          <form onSubmit={handleAssign} className="mt-6 max-w-lg space-y-4 rounded-card border border-line-soft bg-white p-5">
            <Select
              label={t('coach.selectPlayer')}
              required
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              placeholder={t('coach.selectPlayer')}
              options={players.map((p) => ({ value: p.id, label: p.fullName }))}
            />
            <Input
              label={t('coach.tasksPage.taskTitle')}
              required
              placeholder={t('coach.tasksPage.taskTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input label={t('coach.tasksPage.date')} type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            <Button type="submit" loading={saving} disabled={!playerId}>
              {t('coach.tasksPage.assign')}
            </Button>
          </form>

          {playerId && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('coach.tasksPage.assignedTasks')}</h2>
              {loading ? (
                <div className="mt-3 h-24 animate-pulse rounded-card bg-line-soft/30" />
              ) : sorted.length === 0 ? (
                <div className="mt-3">
                  <EmptyState title={t('coach.tasksPage.noTasksYet')} />
                </div>
              ) : (
                <div className="mt-3 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
                  {sorted.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className={`font-medium ${task.completed ? 'text-pitch/40 line-through' : 'text-pitch'}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-pitch/60">{new Date(task.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            task.completed ? 'bg-grass/10 text-grass' : 'bg-warn/10 text-warn'
                          }`}
                        >
                          {task.completed ? t('coach.tasksPage.done') : t('coach.tasksPage.pending')}
                        </span>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(task)}>
                          {t('common.delete')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
