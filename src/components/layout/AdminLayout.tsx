import { useTranslation } from 'react-i18next'
import SectionTabs from '../ui/SectionTabs'
import DesktopSidebar from '../ui/DesktopSidebar'
import OutletTransition from './OutletTransition'

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
    { to: '/admin/messages', label: t('messaging.title') },
    { to: '/admin/match-stats', label: t('admin.matchStatsPage.title') },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-28 md:px-8 lg:flex lg:gap-8 lg:pb-10">
      <DesktopSidebar tabs={TABS} />
      <div className="min-w-0 flex-1">
        <SectionTabs tabs={TABS} />
        <OutletTransition />
      </div>
    </div>
  )
}
