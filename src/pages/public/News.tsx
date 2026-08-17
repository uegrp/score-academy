import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import EmptyState from '../../components/ui/EmptyState'
import type { Announcement } from '../../types'
import { where, orderBy } from '../../lib/collections'

export default function News() {
  const { t } = useTranslation()
  const { data: announcements, loading } = useCollection<Announcement>('announcements', [
    where('published', '==', true),
    orderBy('publishedAt', 'desc'),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 pb-28 md:px-8 lg:pb-16">
      <p className="eyebrow text-grass">{t('newsPage.eyebrow')}</p>
      <h1 className="mt-2 text-4xl text-pitch md:text-5xl">{t('newsPage.title')}</h1>

      {loading ? (
        <div className="mt-10 h-32 animate-pulse rounded-card bg-line-soft/20" />
      ) : announcements.length === 0 ? (
        <div className="mt-10">
          <EmptyState title={t('emptyStates.noAnnouncements')} hint={t('emptyStates.noAnnouncementsHint')} />
        </div>
      ) : (
        <div className="mt-10 space-y-5">
          {announcements.map((a) => (
            <article key={a.id} className="rounded-card border border-line-soft bg-white p-6">
              <p className="eyebrow text-grass">{a.category} · {new Date(a.publishedAt).toLocaleDateString()}</p>
              <h2 className="mt-2 text-2xl text-pitch">{a.title}</h2>
              <p className="mt-2 text-pitch/70">{a.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
