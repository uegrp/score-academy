import { useTranslation } from 'react-i18next'
import SectionTabs from '../ui/SectionTabs'
import DesktopSidebar from '../ui/DesktopSidebar'
import OutletTransition from './OutletTransition'

export default function PlayerLayout() {
  const { t } = useTranslation()

  const TABS = [
    { to: '/player', label: t('bottomNav.dashboard') },
    { to: '/player/attendance', label: t('bottomNav.attendance') },
    { to: '/player/performance', label: t('bottomNav.performance') },
    { to: '/player/tasks', label: t('player.tasksPage.title') },
    { to: '/player/journey', label: t('player.journeyPage.title') },
    { to: '/player/profile', label: t('bottomNav.profile') },
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
