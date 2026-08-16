import { NavLink } from 'react-router-dom'

interface Tab {
  to: string
  label: string
}

export default function SectionTabs({ tabs }: { tabs: Tab[] }) {
  return (
    <div className="-mx-4 mb-6 overflow-x-auto px-4 md:-mx-8 md:px-8">
      <nav className="flex w-max gap-1 border-b border-line-soft">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'border-grass text-pitch' : 'border-transparent text-pitch/50 hover:text-pitch/80'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
