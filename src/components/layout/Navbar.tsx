import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/images/score-logo.png'
import Button from '../ui/Button'

const PUBLIC_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/teams', label: 'Teams' },
  { to: '/matches', label: 'Matches' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
]

const DASHBOARD_BY_ROLE: Record<string, string> = {
  parent: '/parent',
  coach: '/coach',
  admin: '/admin',
  super_admin: '/admin',
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { appUser, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-pitch/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center" aria-label="SCORE home">
          <img src={logo} alt="SCORE" className="h-6 w-auto invert" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {PUBLIC_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `eyebrow transition-colors ${isActive ? 'text-grass-bright' : 'text-bone-dim hover:text-bone'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {appUser ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate(DASHBOARD_BY_ROLE[appUser.role] ?? '/')}>
                Dashboard
              </Button>
              <Button size="sm" variant="secondary" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Join SCORE
              </Button>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-line-soft text-bone lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="font-display text-lg">{open ? '×' : '≡'}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-line-soft bg-pitch px-4 pb-6 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {PUBLIC_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-bone-dim hover:bg-pitch-soft hover:text-bone"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {appUser ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOpen(false)
                    navigate(DASHBOARD_BY_ROLE[appUser.role] ?? '/')
                  }}
                >
                  Dashboard
                </Button>
                <Button variant="secondary" onClick={() => signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOpen(false)
                    navigate('/login')
                  }}
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setOpen(false)
                    navigate('/register')
                  }}
                >
                  Join SCORE
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
