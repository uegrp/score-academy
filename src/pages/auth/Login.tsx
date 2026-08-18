import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import ForgotPassword from '../../components/auth/ForgotPassword'
import BackgroundBlobs from '../../components/ui/BackgroundBlobs'
import logo from '../../assets/images/score-logo.png'

const NORMAL_ROLES = ['player', 'parent', 'coach'] as const
type NormalRole = (typeof NORMAL_ROLES)[number]

const ROLE_DASHBOARD: Record<NormalRole, string> = {
  player: '/player',
  parent: '/parent',
  coach: '/coach',
}

const ROLE_ICON: Record<NormalRole, string> = {
  player: '⚽',
  parent: '👪',
  coach: '📋',
}

function isNormalRole(value: string | null): value is NormalRole {
  return !!value && (NORMAL_ROLES as readonly string[]).includes(value)
}

/**
 * The single login entry point for Player / Parent / Coach — per the
 * SCORE auth architecture, Admin never shares this page or URL (see
 * AdminLogin.tsx at /admin/login instead). Role selection is pure UX:
 * the real authorization check is signInAndGetRole() comparing the
 * Firestore-stored role against the selected card, never the card itself.
 */
export default function Login() {
  const { t } = useTranslation()
  const { signInAndGetRole, signOut, configured } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const preselected = searchParams.get('role')
  // If we arrived here via a redirect from a protected route (e.g. someone
  // hit /coach directly while signed out), skip straight to the form —
  // otherwise start on the role-choice screen.
  const [selectedRole, setSelectedRole] = useState<NormalRole | null>(isNormalRole(preselected) ? preselected : null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedRole) return
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
      // and tell them exactly which card their account actually is.
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

  const roleCards: { key: NormalRole; label: string; hint: string }[] = [
    { key: 'player', label: t('auth.roleNames.player'), hint: t('auth.playerLoginHint') },
    { key: 'parent', label: t('auth.roleNames.parent'), hint: t('auth.parentLoginHint') },
    { key: 'coach', label: t('auth.roleNames.coach'), hint: t('auth.coachLoginHint') },
  ]

  // ---- Step 1: choose role ----
  if (!selectedRole) {
    return (
      <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-bone px-4 py-16">
        <BackgroundBlobs />
        <div className="relative w-full max-w-sm">
          <img src={logo} alt="SCORE" className="mx-auto h-10 w-auto object-contain" />
          <p className="mt-8 text-center eyebrow text-grass">{t('auth.loginEyebrow')}</p>
          <h1 className="mt-2 text-center text-4xl text-pitch">{t('auth.whoAreYou')}</h1>

          <div className="mt-8 flex flex-col gap-3">
            {roleCards.map((r, i) => (
              <motion.button
                key={r.key}
                type="button"
                onClick={() => setSelectedRole(r.key)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-4 rounded-card border border-line-soft bg-white p-5 text-start shadow-sm transition-shadow hover:border-grass hover:shadow-lg"
              >
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-grass/10 text-2xl" aria-hidden="true">
                  {ROLE_ICON[r.key]}
                </span>
                <span>
                  <span className="block text-lg font-semibold text-pitch">{r.label}</span>
                  <span className="block text-sm text-pitch/60">{r.hint}</span>
                </span>
              </motion.button>
            ))}
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

  // ---- Step 2: sign in as the selected role ----
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-bone px-4 py-16">
      <BackgroundBlobs />
      <div className="relative w-full max-w-sm">
        <img src={logo} alt="SCORE" className="mx-auto h-10 w-auto object-contain" />
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className="mt-6 flex items-center gap-1 text-sm text-pitch/60 hover:text-pitch"
        >
          <span aria-hidden="true" className="rtl:-scale-x-100">←</span> {t('auth.backToAccountType')}
        </button>

        <div className="mt-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-grass/10 text-xl" aria-hidden="true">
            {ROLE_ICON[selectedRole]}
          </span>
          <div>
            <p className="eyebrow text-grass">{t('auth.roleNames.' + selectedRole)}</p>
            <h1 className="text-2xl text-pitch">{t('auth.signIn')}</h1>
          </div>
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
