import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SectionTabs from '../ui/SectionTabs'

export default function CoachLayout() {
  const { t } = useTranslation()

  const TABS = [
    { to: '/coach', label: t('bottomNav.dashboard') },
    { to: '/coach/players', label: t('bottomNav.players') },
    { to: '/coach/attendance', label: t('bottomNav.attendance') },
    { to: '/coach/evaluations', label: t('bottomNav.evaluate') },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 md:px-8 lg:pb-10">
      <SectionTabs tabs={TABS} />
      <Outlet />
    </div>
  )
}
