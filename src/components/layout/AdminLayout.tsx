import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SectionTabs from '../ui/SectionTabs'

export default function AdminLayout() {
  const { t } = useTranslation()

  const TABS = [
    { to: '/admin', label: t('bottomNav.dashboard') },
    { to: '/admin/players', label: t('admin.players') },
    { to: '/admin/coaches', label: t('admin.coachesPage') },
    { to: '/admin/teams', label: t('admin.teamsPage') },
    { to: '/admin/programs', label: t('admin.programsPage') },
    { to: '/admin/training', label: t('admin.trainingPage') },
    { to: '/admin/matches', label: t('admin.matchesPage') },
    { to: '/admin/announcements', label: t('admin.newsPage') },
    { to: '/admin/gallery', label: t('admin.galleryPage') },
    { to: '/admin/registrations', label: t('admin.registrationsPage') },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 md:px-8 lg:pb-10">
      <SectionTabs tabs={TABS} />
      <Outlet />
    </div>
  )
}
