import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
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

  const PLAYER_TABS = [
    { to: '/player', label: t('bottomNav.dashboard'), icon: '⌂' },
    { to: '/player/attendance', label: t('bottomNav.attendance'), icon: '✓' },
    { to: '/player/performance', label: t('bottomNav.performance'), icon: '◆' },
    { to: '/player/profile', label: t('bottomNav.profile'), icon: '●' },
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
      : appUser.role === 'player'
        ? PLAYER_TABS
        : appUser.role === 'coach'
          ? COACH_TABS
          : ADMIN_TABS

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 pb-2 lg:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between rounded-pill border border-line-soft/60 bg-pitch/95 px-1 py-1 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)] backdrop-blur-lg">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink to={tab.to} end className="relative flex flex-col items-center gap-0.5 rounded-pill px-1 py-2">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-pill"
                      className="absolute inset-1 rounded-pill bg-grass/20"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <motion.span
                    aria-hidden="true"
                    className={`relative text-base leading-none ${isActive ? 'text-grass-bright' : 'text-line'}`}
                    animate={isActive ? { y: -1, scale: 1.1 } : { y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {tab.icon}
                  </motion.span>
                  <span
                    className={`relative text-[0.62rem] uppercase tracking-wide ${
                      isActive ? 'font-semibold text-grass-bright' : 'text-line'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
