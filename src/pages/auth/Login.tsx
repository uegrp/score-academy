import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import ForgotPassword from '../../components/auth/ForgotPassword'
import logo from '../../assets/images/score-logo.png'

const NORMAL_ROLES = ['player', 'parent', 'coach'] as const
type NormalRole = (typeof NORMAL_ROLES)[number]

const ROLE_DASHBOARD: Record<NormalRole, string> = {
  player: '/player',
  parent: '/parent',
  coach: '/coach',
}

function isNormalRole(value: string | null): value is NormalRole {
  return !!value && (NORMAL_ROLES as readonly string[]).includes(value)
}

/**
 * The single login entry point for Player / Parent / Coach — per the
 * SCORE auth architecture, Admin never shares this page or URL (see
 * AdminLogin.tsx at /admin/login instead). The role tabs here are pure
 * UX: the real authorization check is signInAndGetRole() comparing the
 * Firestore-stored role against the selected tab, never the tab itself.
 */
export default function Login() {
  const { t } = useTranslation()
  const { signInAndGetRole, signOut, configured } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const preselected = searchParams.get('role')
  const [selectedRole, setSelectedRole] = useState<NormalRole>(isNormalRole(preselected) ? preselected : 'parent')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const actualRole = await signInAndGetRole(email, password)
      if (actualRole === selectedRole) {
        navigate(ROLE_DASHBOARD[selectedRole])
        return
      }
      // The password was correct, but this account isn't the role they
      // picked — never let them into the wrong dashboard. Sign back out
      // and tell them exactly which tab their account actually is.
      await signOut()
      if (actualRole === 'admin' || actualRole === 'super_admin') {
        setError(t('auth.errors.isAdminAccount'))
      } else if (isNormalRole(actualRole)) {
        setError(t('auth.errors.wrongRoleTab', { role: t(`auth.roleNames.${actualRole}`) }))
      } else {
        setError(t('auth.errors.loginGeneric'))
      }
    } catch (err) {
      console.error('[SCORE] Sign in failed:', err)
      setError(err instanceof Error ? mapError(err.message, t) : t('auth.errors.loginGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const roleTabs: { key: NormalRole; label: string }[] = [
    { key: 'player', label: t('auth.roleNames.player') },
    { key: 'parent', label: t('auth.roleNames.parent') },
    { key: 'coach', label: t('auth.roleNames.coach') },
  ]

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-bone px-4 py-16">
      <div className="w-full max-w-sm">
        <img src={logo} alt="SCORE" className="mx-auto h-10 w-auto object-contain" />
        <p className="mt-8 eyebrow text-grass">{t('auth.loginEyebrow')}</p>
        <h1 className="mt-2 text-4xl text-pitch">{t('auth.whoAreYou')}</h1>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {roleTabs.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => {
                setSelectedRole(r.key)
                setError(null)
              }}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                selectedRole === r.key ? 'border-grass bg-grass/10 text-grass' : 'border-line text-pitch/60 hover:text-pitch'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {!configured && (
          <p className="mt-4 rounded-card border border-warn/40 bg-warn/10 p-3 text-sm text-pitch">
            {t('auth.notConfigured')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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

        <div className="mt-4 text-center">
          <ForgotPassword />
        </div>

        <p className="mt-6 text-center text-sm text-pitch/70">
          {t('auth.newToScore')}{' '}
          <Link to="/register" className="font-medium text-grass hover:text-grass-bright">
            {t('auth.joinAcademy')}
          </Link>
        </p>
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

function mapError(message: string, t: (key: string, opts?: Record<string, unknown>) => string) {
  if (message.includes('invalid-credential') || message.includes('wrong-password')) {
    return t('auth.errors.invalidCredential')
  }
  if (message.includes('user-not-found')) return t('auth.errors.userNotFound')
  if (message.includes('too-many-requests')) return t('auth.errors.tooManyRequests')
  return t('auth.errors.loginGeneric')
}
