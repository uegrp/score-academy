import { useTranslation } from 'react-i18next'
import SectionTabs from '../ui/SectionTabs'
import DesktopSidebar from '../ui/DesktopSidebar'
import OutletTransition from './OutletTransition'

export default function CoachLayout() {
  const { t } = useTranslation()

  const TABS = [
    { to: '/coach', label: t('bottomNav.dashboard') },
    { to: '/coach/players', label: t('bottomNav.players') },
    { to: '/coach/attendance', label: t('bottomNav.attendance') },
    { to: '/coach/evaluations', label: t('bottomNav.evaluate') },
    { to: '/coach/tasks', label: t('coach.tasksPage.title') },
    { to: '/coach/match-stats', label: t('admin.matchStatsPage.title') },
    { to: '/coach/gallery', label: t('admin.galleryPage') },
    { to: '/coach/messages', label: t('messaging.title') },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 md:px-8 lg:flex lg:gap-8 lg:pb-10">
      <DesktopSidebar tabs={TABS} />
      <div className="min-w-0 flex-1">
        <SectionTabs tabs={TABS} />
        <OutletTransition />
      </div>
    </div>
  )
}
