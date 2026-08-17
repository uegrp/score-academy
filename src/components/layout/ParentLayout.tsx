import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SectionTabs from '../ui/SectionTabs'

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
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 md:px-8 lg:pb-10">
      <SectionTabs tabs={TABS} />
      <Outlet />
    </div>
  )
}
