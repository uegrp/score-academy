import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PUBLIC_TABS = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/programs', label: 'Training', icon: '◐' },
  { to: '/matches', label: 'Matches', icon: '◫' },
  { to: '/gallery', label: 'Gallery', icon: '▦' },
]

const PARENT_TABS = [
  { to: '/parent', label: 'Dashboard', icon: '⌂' },
  { to: '/parent/training', label: 'Training', icon: '◐' },
  { to: '/parent/attendance', label: 'Attendance', icon: '✓' },
  { to: '/parent/performance', label: 'Performance', icon: '◆' },
  { to: '/parent/profile', label: 'Profile', icon: '●' },
]

const COACH_TABS = [
  { to: '/coach', label: 'Dashboard', icon: '⌂' },
  { to: '/coach/players', label: 'Players', icon: '●' },
  { to: '/coach/attendance', label: 'Attendance', icon: '✓' },
  { to: '/coach/evaluations', label: 'Evaluate', icon: '◆' },
]

const ADMIN_TABS = [
  { to: '/admin', label: 'Dashboard', icon: '⌂' },
  { to: '/admin/players', label: 'Players', icon: '●' },
  { to: '/admin/teams', label: 'Teams', icon: '◫' },
  { to: '/admin/registrations', label: 'Requests', icon: '✎' },
]

export default function MobileBottomNav() {
  const { appUser } = useAuth()

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
