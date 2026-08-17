import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/images/score-logo.png'
import Button from '../ui/Button'
import LanguageSwitcher from '../ui/LanguageSwitcher'

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
  const { t } = useTranslation()

  const PUBLIC_LINKS = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/programs', label: t('nav.programs') },
    { to: '/teams', label: t('nav.teams') },
    { to: '/matches', label: t('nav.matches') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/news', label: t('nav.news') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-pitch/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center rounded-lg bg-bone px-2.5 py-1.5" aria-label="SCORE home">
          <img src={logo} alt="SCORE" className="h-6 w-auto object-contain" />
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
          <LanguageSwitcher />
          {appUser ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate(DASHBOARD_BY_ROLE[appUser.role] ?? '/')}>
                {t('nav.dashboard')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => signOut()}>
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
                {t('nav.login')}
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                {t('nav.join')}
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-line-soft text-bone"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="font-display text-lg">{open ? '×' : '≡'}</span>
          </button>
        </div>
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
                  {t('nav.dashboard')}
                </Button>
                <Button variant="secondary" onClick={() => signOut()}>
                  {t('nav.logout')}
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
                  {t('nav.login')}
                </Button>
                <Button
                  onClick={() => {
                    setOpen(false)
                    navigate('/register')
                  }}
                >
                  {t('nav.join')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
