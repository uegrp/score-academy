import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import EmptyState from '../../components/ui/EmptyState'
import BackgroundBlobs from '../../components/ui/BackgroundBlobs'
import type { Player, TrainingSession, Announcement } from '../../types'
import { where } from '../../lib/collections'

export default function ParentDashboard() {
  const { t } = useTranslation()
  const { appUser } = useAuth()

  const { data: players, loading: playersLoading } = useCollection<Player>(
    'players',
    appUser ? [where('parentUserIds', 'array-contains', appUser.uid)] : []
  )
  const { data: announcements } = useCollection<Announcement>('announcements', [where('published', '==', true)])
  const { data: sessions } = useCollection<TrainingSession>('trainingSessions')

  return (
    <div className="relative">
      <BackgroundBlobs />
      <div className="relative">
      <p className="eyebrow text-grass">{t('parent.dashboardEyebrow')}</p>
      <h1 className="mt-2 text-4xl text-pitch">
        {t('parent.welcomeBack', { name: appUser?.displayName ? `, ${appUser.displayName.split(' ')[0]}` : '' })}
      </h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('parent.yourPlayers')}</h2>
        {playersLoading ? (
          <SkeletonRow />
        ) : players.length === 0 ? (
          <EmptyState title={t('parent.noPlayersLinked')} hint={t('parent.noPlayersLinkedHint')} />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {players.map((p) => (
              <div key={p.id} className="rounded-card border border-line-soft bg-white p-5">
                <p className="text-lg font-semibold text-pitch">{p.fullName}</p>
                <p className="text-sm text-pitch/60">{p.preferredPosition} · {p.currentLevel}</p>
                <span className="mt-3 inline-block rounded-full bg-grass/10 px-3 py-1 text-xs font-medium text-grass">
                  {p.status === 'active' ? t('common.active') : p.status === 'pending' ? t('parent.pendingReview') : t('common.archived')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/parent/checkin"
          className="flex items-center justify-between rounded-card border border-grass/30 bg-grass/5 p-5 transition-colors hover:bg-grass/10"
        >
          <div>
            <p className="text-lg font-semibold text-pitch">{t('parent.checkIn.title')}</p>
            <p className="text-sm text-pitch/60">{t('parent.checkIn.subtitle')}</p>
          </div>
          <span aria-hidden="true" className="text-2xl text-grass rtl:-scale-x-100">
            →
          </span>
        </Link>

        <Link
          to="/parent/messages"
          className="flex items-center justify-between rounded-card border border-line-soft bg-white p-5 transition-colors hover:bg-bone-dim/20"
        >
          <div>
            <p className="text-lg font-semibold text-pitch">{t('messaging.title')}</p>
            <p className="text-sm text-pitch/60">{t('messaging.parentSubtitle')}</p>
          </div>
          <span aria-hidden="true" className="text-2xl text-pitch/40 rtl:-scale-x-100">
            →
          </span>
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('parent.upcomingTraining')}</h2>
          {sessions.length === 0 ? (
            <EmptyState title={t('emptyStates.noTraining')} />
          ) : (
            <ul className="mt-4 space-y-3">
              {sessions.slice(0, 4).map((s) => (
                <li key={s.id} className="rounded-card border border-line-soft bg-white p-4 text-sm">
                  <p className="font-medium text-pitch">{s.type}</p>
                  <p className="text-pitch/60">{new Date(s.date).toLocaleDateString()} · {s.time} · {s.location}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('parent.announcements')}</h2>
          {announcements.length === 0 ? (
            <EmptyState title={t('emptyStates.noAnnouncements')} />
          ) : (
            <ul className="mt-4 space-y-3">
              {announcements.slice(0, 4).map((a) => (
                <li key={a.id} className="rounded-card border border-line-soft bg-white p-4 text-sm">
                  <p className="font-medium text-pitch">{a.title}</p>
                  <p className="line-clamp-2 text-pitch/60">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-card bg-line-soft/30" />
      ))}
    </div>
  )
}
