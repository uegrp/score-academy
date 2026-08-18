import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { where, orderBy, updateDocById } from '../../lib/collections'
import { isSameDay } from '../../lib/dates'
import type { Player, Team, PerformanceEvaluation, AttendanceRecord, DailyTask } from '../../types'
import { computeFifaAttributes } from '../../lib/fifaCard'
import FifaPlayerCard from '../../components/player/FifaPlayerCard'
import AnimatedNumber from '../../components/motion/AnimatedNumber'
import AnimatedCheckbox from '../../components/motion/AnimatedCheckbox'
import BackgroundBlobs from '../../components/ui/BackgroundBlobs'
import EmptyState from '../../components/ui/EmptyState'

export default function PlayerDashboard() {
  const { t } = useTranslation()
  const { appUser } = useAuth()

  const { data: players, loading: playerLoading } = useCollection<Player>(
    'players',
    appUser ? [where('playerUserId', '==', appUser.uid)] : []
  )
  const player = players[0]

  const { data: teams } = useCollection<Team>('teams')
  const { data: evaluations, loading: evalLoading } = useCollection<PerformanceEvaluation>(
    'performanceEvaluations',
    player ? [where('playerId', '==', player.id), orderBy('date', 'desc')] : [],
    [player?.id]
  )
  const { data: attendance } = useCollection<AttendanceRecord>(
    'attendance',
    player ? [where('playerId', '==', player.id)] : [],
    [player?.id]
  )
  const { data: tasks } = useCollection<DailyTask>(
    'dailyTasks',
    player ? [where('playerId', '==', player.id)] : [],
    [player?.id]
  )
  const todaysTasks = tasks.filter((task) => isSameDay(task.date, Date.now()))

  async function toggleTask(task: DailyTask) {
    try {
      await updateDocById('dailyTasks', task.id, { completed: !task.completed })
    } catch {
      // No user-facing error needed — the checkbox simply won't flip.
    }
  }

  if (playerLoading) {
    return <div className="h-64 animate-pulse rounded-card bg-line-soft/30" />
  }

  if (!player) {
    return (
      <div>
        <h1 className="text-3xl text-pitch">{t('player.dashboardEyebrow')}</h1>
        <div className="mt-6">
          <EmptyState title={t('player.notLinkedYet')} hint={t('player.notLinkedYetHint')} />
        </div>
      </div>
    )
  }

  const latest = evaluations[0]
  const attributes = latest ? computeFifaAttributes(latest) : null
  const teamName = teams.find((tm) => tm.id === player.teamId)?.name

  const total = attendance.length
  const present = attendance.filter((a) => a.status === 'present').length
  const late = attendance.filter((a) => a.status === 'late').length
  const attendancePct = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : null

  return (
    <div className="relative">
      <BackgroundBlobs />
      <div className="relative">
        <p className="eyebrow text-grass">{t('player.dashboardEyebrow')}</p>
        <h1 className="mt-2 text-4xl text-pitch">{t('player.welcome', { name: player.fullName.split(' ')[0] })}</h1>

        <div className="mt-8 flex flex-wrap gap-6">
          {evalLoading ? (
            <div className="h-96 w-full max-w-sm animate-pulse rounded-card bg-line-soft/30" />
          ) : attributes ? (
            <FifaPlayerCard
              name={player.fullName}
              position={player.preferredPosition}
              teamName={teamName}
              jerseyNumber={player.jerseyNumber}
              photoUrl={player.photoUrl}
              attributes={attributes}
            />
          ) : (
            <div className="w-full max-w-sm">
              <EmptyState title={t('player.noEvaluationYet')} hint={t('player.noEvaluationYetHint')} />
            </div>
          )}

          <div className="grid flex-1 grid-cols-2 gap-4 self-start sm:grid-cols-3">
            {attendancePct !== null ? (
              <div className="rounded-card border border-line-soft bg-white p-4">
                <AnimatedNumber value={attendancePct} suffix="%" className="stat-figure block text-xl text-pitch" />
                <p className="mt-1 text-xs uppercase tracking-wide text-pitch/60">{t('player.attendanceRate')}</p>
              </div>
            ) : (
              <StatCard label={t('player.attendanceRate')} value="—" />
            )}
            <StatCard label={t('parent.team')} value={teamName ?? t('parent.notAssigned')} />
            <StatCard label={t('auth.currentLevel')} value={player.currentLevel} />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('player.tasksPage.today')}</p>
            <Link to="/player/tasks" className="text-sm font-medium text-grass hover:text-grass-bright">
              {t('player.tasksPage.viewAll')}
            </Link>
          </div>
          {todaysTasks.length === 0 ? (
            <p className="mt-3 text-sm text-pitch/50">{t('player.tasksPage.noneToday')}</p>
          ) : (
            <div className="mt-3 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
              {todaysTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-4">
                  <AnimatedCheckbox checked={task.completed} onChange={() => toggleTask(task)} label={task.title} />
                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    className={`text-start ${task.completed ? 'text-pitch/40 line-through' : 'text-pitch'}`}
                  >
                    {task.title}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line-soft bg-white p-4">
      <p className="stat-figure text-xl text-pitch">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-pitch/60">{label}</p>
    </div>
  )
}
