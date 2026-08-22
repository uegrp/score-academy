import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import ForgotPassword from './ForgotPassword'
import GlassAuthCard from './GlassAuthCard'
import { GlassEmailField, GlassPasswordField } from './GlassFormField'
import GlassSubmitButton from './GlassSubmitButton'
import authBg from '../../assets/images/auth-bg-login.jpg'
import logoWhite from '../../assets/images/score-logo-white.png'
import type { UserRole } from '../../types'

interface Props {
  allowedRoles: UserRole[]
  redirectTo: string
  eyebrow: string
  title: string
  wrongRoleMessage: string
  showJoinLink?: boolean
}

export default function RoleLoginForm({ allowedRoles, redirectTo, eyebrow, title, wrongRoleMessage, showJoinLink }: Props) {
  const { t } = useTranslation()
  const { signInAndGetRole, signOut, configured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const role = await signInAndGetRole(email, password)
      if (!role || !allowedRoles.includes(role)) {
        // Reject immediately and sign back out — this account is real and
        // the password was correct, but it doesn't belong on this specific
        // login screen. Never leave them signed in on the wrong role.
        await signOut()
        setError(wrongRoleMessage)
        return
      }
      navigate(redirectTo)
    } catch (err) {
      console.error('[SCORE] Sign in failed:', err)
      setError(err instanceof Error ? mapError(err.message, t) : t('auth.errors.loginGeneric'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassAuthCard image={authBg}>
      <img src={logoWhite} alt="SCORE" className="mx-auto h-9 w-auto object-contain" />
      <p className="mt-8 text-center text-xs font-medium uppercase tracking-wide text-[#3A8F8B]">{eyebrow}</p>
      <h1 className="mt-2 text-center text-2xl font-semibold text-white">{title}</h1>

      {!configured && (
        <p className="mt-4 rounded-2xl border border-white/15 bg-white/[0.06] p-3 text-sm text-white/70">
          {t('auth.notConfigured')}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <GlassEmailField
          label={t('auth.email')}
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <GlassPasswordField
          label={t('auth.password')}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-[#E74747]">{error}</p>}

        <GlassSubmitButton loading={loading} disabled={!configured}>
          {t('auth.signIn')}
        </GlassSubmitButton>
      </form>

      <div className="mt-4 text-center">
        <ForgotPassword dark />
      </div>

      {showJoinLink && (
        <p className="mt-6 text-center text-sm text-white/60">
          {t('auth.newToScore')}{' '}
          <Link to="/register" className="font-medium text-[#3A8F8B] hover:text-white">
            {t('auth.joinAcademy')}
          </Link>
        </p>
      )}
    </GlassAuthCard>
  )
}

function mapError(message: string, t: (key: string) => string) {
  if (message.includes('invalid-credential') || message.includes('wrong-password')) {
    return t('auth.errors.invalidCredential')
  }
  if (message.includes('user-not-found')) return t('auth.errors.userNotFound')
  if (message.includes('too-many-requests')) return t('auth.errors.tooManyRequests')
  return t('auth.errors.loginGeneric')
}
