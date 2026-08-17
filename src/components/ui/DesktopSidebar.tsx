import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Tab {
  to: string
  label: string
}

/**
 * Desktop-only vertical sidebar — the app-shell counterpart to
 * SectionTabs (which stays mobile-only). Same tabs, same routes, just a
 * different layout so large screens feel like a real product shell
 * (sidebar + content) rather than a stretched mobile page.
 */
export default function DesktopSidebar({ tabs }: { tabs: Tab[] }) {
  return (
    <nav className="hidden lg:sticky lg:top-20 lg:block lg:h-fit lg:w-56 lg:flex-shrink-0 lg:space-y-1">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end
          className={({ isActive }) =>
            `relative block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'text-bone' : 'text-pitch/60 hover:bg-bone-dim/20 hover:text-pitch'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="desktop-sidebar-pill"
                  className="absolute inset-0 rounded-xl bg-grass"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
