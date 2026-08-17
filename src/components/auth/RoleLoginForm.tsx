import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import logo from '../../assets/images/score-logo.png'
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
    <div className="flex min-h-[80vh] items-center justify-center bg-bone px-4 py-16">
      <div className="w-full max-w-sm">
        <img src={logo} alt="SCORE" className="mx-auto h-10 w-auto object-contain" />
        <p className="mt-8 eyebrow text-grass">{eyebrow}</p>
        <h1 className="mt-2 text-4xl text-pitch">{title}</h1>

        {!configured && (
          <p className="mt-4 rounded-card border border-warn/40 bg-warn/10 p-3 text-sm text-pitch">
            {t('auth.notConfigured')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field label={t('auth.email')}>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </Field>
          <Field label={t('auth.password')}>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </Field>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" loading={loading} className="mt-2 w-full" disabled={!configured}>
            {t('auth.signIn')}
          </Button>
        </form>

        {showJoinLink && (
          <p className="mt-6 text-center text-sm text-pitch/70">
            {t('auth.newToScore')}{' '}
            <Link to="/register" className="font-medium text-grass hover:text-grass-bright">
              {t('auth.joinAcademy')}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow text-pitch/60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
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
