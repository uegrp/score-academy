import { useTranslation } from 'react-i18next'
import SectionTabs from '../ui/SectionTabs'
import DesktopSidebar from '../ui/DesktopSidebar'
import OutletTransition from './OutletTransition'

export default function ParentLayout() {
  const { t } = useTranslation()

  const TABS = [
    { to: '/parent', label: t('bottomNav.dashboard') },
    { to: '/parent/training', label: t('bottomNav.training') },
    { to: '/parent/attendance', label: t('bottomNav.attendance') },
    { to: '/parent/performance', label: t('bottomNav.performance') },
    { to: '/parent/profile', label: t('bottomNav.profile') },
    { to: '/parent/messages', label: t('messaging.title') },
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
