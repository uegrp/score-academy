import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AuthBackground from '../../components/auth/AuthBackground'
import authBg from '../../assets/images/auth-bg-register.jpg'
import logo from '../../assets/images/score-logo.png'
import ParentRegisterForm from './ParentRegisterForm'
import PlayerRegisterForm from './PlayerRegisterForm'

type AccountType = 'player' | 'parent' | null

/**
 * Public "Create Account" entry point. Coach is deliberately absent here —
 * per the SCORE auth architecture, coach accounts are only created via
 * the admin panel, never public self-signup.
 */
export default function Register() {
  const { t } = useTranslation()
  const [accountType, setAccountType] = useState<AccountType>(null)

  if (accountType === 'parent') return <ParentRegisterForm onBack={() => setAccountType(null)} />
  if (accountType === 'player') return <PlayerRegisterForm onBack={() => setAccountType(null)} />

  return (
    <AuthBackground image={authBg}>
      <div className="text-center">
        <img src={logo} alt="SCORE" className="mx-auto h-10 w-auto object-contain" />
        <p className="mt-8 eyebrow text-grass">{t('auth.registerEyebrow')}</p>
        <h1 className="mt-2 text-4xl text-pitch">{t('auth.whatAccountType')}</h1>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setAccountType('player')}
            className="rounded-card border border-line-soft bg-white p-5 text-start transition-colors hover:border-grass"
          >
            <p className="text-lg font-semibold text-pitch">{t('auth.roleNames.player')}</p>
            <p className="mt-1 text-sm text-pitch/60">{t('auth.playerAccountHint')}</p>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('parent')}
            className="rounded-card border border-line-soft bg-white p-5 text-start transition-colors hover:border-grass"
          >
            <p className="text-lg font-semibold text-pitch">{t('auth.roleNames.parent')}</p>
            <p className="mt-1 text-sm text-pitch/60">{t('auth.parentAccountHint')}</p>
          </button>
        </div>
      </div>
    </AuthBackground>
  )
}
