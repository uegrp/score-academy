import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { updateDocById, where } from '../../lib/collections'
import { isSameDay } from '../../lib/dates'
import type { Player, DailyTask } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import AnimatedCheckbox from '../../components/motion/AnimatedCheckbox'

export default function PlayerTasks() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const { data: players } = useCollection<Player>('players', appUser ? [where('playerUserId', '==', appUser.uid)] : [])
  const player = players[0]

  const { data: tasks, loading } = useCollection<DailyTask>(
    'dailyTasks',
    player ? [where('playerId', '==', player.id)] : [],
    [player?.id]
  )

  const now = Date.now()
  const today = tasks.filter((task) => isSameDay(task.date, now))
  const upcoming = tasks.filter((task) => task.date > now && !isSameDay(task.date, now)).sort((a, b) => a.date - b.date)
  const past = tasks
    .filter((task) => task.date < now && !isSameDay(task.date, now))
    .sort((a, b) => b.date - a.date)

  async function toggle(task: DailyTask) {
    try {
      await updateDocById('dailyTasks', task.id, { completed: !task.completed })
    } catch {
      // Silent — the checkbox will simply not visually flip if this fails
      // (e.g. a permissions edge case), which is enough feedback here.
    }
  }

  if (!player) {
    return (
      <div>
        <h1 className="text-3xl text-pitch">{t('player.tasksPage.title')}</h1>
        <div className="mt-6">
          <EmptyState title={t('player.notLinkedYet')} hint={t('player.notLinkedYetHint')} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('player.tasksPage.title')}</h1>

      {loading ? (
        <div className="mt-6 h-32 animate-pulse rounded-card bg-line-soft/30" />
      ) : (
        <div className="mt-6 space-y-8">
          <TaskGroup title={t('player.tasksPage.today')} tasks={today} onToggle={toggle} emptyLabel={t('player.tasksPage.noneToday')} />
          {upcoming.length > 0 && (
            <TaskGroup title={t('player.tasksPage.upcoming')} tasks={upcoming} onToggle={toggle} showDate />
          )}
          {past.length > 0 && <TaskGroup title={t('player.tasksPage.past')} tasks={past} onToggle={toggle} showDate />}
          {tasks.length === 0 && <EmptyState title={t('player.tasksPage.noTasksAtAll')} />}
        </div>
      )}
    </div>
  )
}

function TaskGroup({
  title,
  tasks,
  onToggle,
  emptyLabel,
  showDate,
}: {
  title: string
  tasks: DailyTask[]
  onToggle: (task: DailyTask) => void
  emptyLabel?: string
  showDate?: boolean
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-pitch/60">{title}</p>
      {tasks.length === 0 && emptyLabel ? (
        <p className="text-sm text-pitch/50">{emptyLabel}</p>
      ) : (
        <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-4">
              <AnimatedCheckbox checked={task.completed} onChange={() => onToggle(task)} label={task.title} />
              <button type="button" onClick={() => onToggle(task)} className="text-start">
                <p className={task.completed ? 'text-pitch/40 line-through' : 'text-pitch'}>{task.title}</p>
                {showDate && <p className="text-xs text-pitch/50">{new Date(task.date).toLocaleDateString()}</p>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
