import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function MobileBottomNav() {
  const { appUser } = useAuth()
  const { t } = useTranslation()

  const PUBLIC_TABS = [
    { to: '/', label: t('bottomNav.home'), icon: '⌂' },
    { to: '/programs', label: t('bottomNav.training'), icon: '◐' },
    { to: '/matches', label: t('bottomNav.matches'), icon: '◫' },
    { to: '/gallery', label: t('bottomNav.gallery'), icon: '▦' },
  ]

  const PARENT_TABS = [
    { to: '/parent', label: t('bottomNav.dashboard'), icon: '⌂' },
    { to: '/parent/training', label: t('bottomNav.training'), icon: '◐' },
    { to: '/parent/attendance', label: t('bottomNav.attendance'), icon: '✓' },
    { to: '/parent/performance', label: t('bottomNav.performance'), icon: '◆' },
    { to: '/parent/profile', label: t('bottomNav.profile'), icon: '●' },
  ]

  const COACH_TABS = [
    { to: '/coach', label: t('bottomNav.dashboard'), icon: '⌂' },
    { to: '/coach/players', label: t('bottomNav.players'), icon: '●' },
    { to: '/coach/attendance', label: t('bottomNav.attendance'), icon: '✓' },
    { to: '/coach/evaluations', label: t('bottomNav.evaluate'), icon: '◆' },
  ]

  const ADMIN_TABS = [
    { to: '/admin', label: t('bottomNav.dashboard'), icon: '⌂' },
    { to: '/admin/players', label: t('bottomNav.players'), icon: '●' },
    { to: '/admin/teams', label: t('bottomNav.teams'), icon: '◫' },
    { to: '/admin/registrations', label: t('bottomNav.requests'), icon: '✎' },
  ]

  const tabs = !appUser
    ? PUBLIC_TABS
    : appUser.role === 'parent'
      ? PARENT_TABS
      : appUser.role === 'coach'
        ? COACH_TABS
        : ADMIN_TABS

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-pitch/98 backdrop-blur lg:hidden">
      <ul className="flex items-stretch justify-between px-1">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[0.65rem] uppercase tracking-wide ${
                  isActive ? 'text-grass-bright' : 'text-line'
                }`
              }
            >
              <span aria-hidden="true" className="text-base leading-none">
                {t.icon}
              </span>
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
