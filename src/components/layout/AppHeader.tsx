import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const MESSAGES_PATH: Partial<Record<string, string>> = {
  parent: '/parent/messages',
  coach: '/coach/messages',
  admin: '/admin/messages',
  super_admin: '/admin/messages',
}

/**
 * The mobile-first app header shown on dashboard pages — a personal
 * greeting instead of a website nav bar. The desktop Navbar (with full
 * site links) still renders at lg+ where a persistent nav makes sense;
 * this component is mobile-only.
 */
export default function AppHeader() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { appUser, signOut } = useAuth()

  const hour = new Date().getHours()
  const greetingKey = hour < 12 ? 'goodMorning' : hour < 18 ? 'goodAfternoon' : 'goodEvening'
  const firstName = appUser?.displayName?.split(' ')[0] ?? ''
  const messagesPath = appUser ? MESSAGES_PATH[appUser.role] : undefined

  return (
    <header className="sticky top-0 z-30 border-b border-line-soft/50 bg-pitch/95 px-4 py-4 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <p className="text-lg leading-tight text-bone">
            {t(`appHeader.${greetingKey}`, { name: firstName ? `, ${firstName}` : '' })} <span aria-hidden="true">👋</span>
          </p>
          <p className="eyebrow text-grass-bright">{t('appHeader.subtitle')}</p>
        </motion.div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <LanguageSwitcher />
          {messagesPath && (
            <button
              onClick={() => navigate(messagesPath)}
              aria-label={t('messaging.title')}
              className="grid h-9 w-9 place-items-center rounded-full border border-line-soft text-bone transition-colors hover:border-bone-dim"
            >
              <span aria-hidden="true">🔔</span>
            </button>
          )}
          <button
            onClick={() => signOut()}
            aria-label={t('nav.logout')}
            className="grid h-9 w-9 place-items-center rounded-full border border-line-soft text-bone transition-colors hover:border-bone-dim"
          >
            <span aria-hidden="true">⎋</span>
          </button>
        </div>
      </div>
    </header>
  )
}
