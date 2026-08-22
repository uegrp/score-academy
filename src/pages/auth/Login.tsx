import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import ForgotPassword from '../../components/auth/ForgotPassword'
import GlassAuthCard from '../../components/auth/GlassAuthCard'
import { GlassEmailField, GlassPasswordField } from '../../components/auth/GlassFormField'
import GlassSubmitButton from '../../components/auth/GlassSubmitButton'
import authBg from '../../assets/images/auth-bg-login.jpg'
import logoWhite from '../../assets/images/score-logo-white.png'

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
      <GlassAuthCard image={authBg}>
        <img src={logoWhite} alt="SCORE" className="mx-auto h-9 w-auto object-contain" />
        <p className="mt-8 text-center text-xs font-medium uppercase tracking-wide text-[#3A8F8B]">
          {t('auth.loginEyebrow')}
        </p>
        <h1 className="mt-2 text-center text-3xl font-semibold text-white">{t('auth.whoAreYou')}</h1>

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
              className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] p-4 text-start transition-colors hover:border-[#3A8F8B]/60 hover:bg-white/[0.1]"
            >
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-white/10 text-xl" aria-hidden="true">
                {ROLE_ICON[r.key]}
              </span>
              <span>
                <span className="block text-base font-semibold text-white">{r.label}</span>
                <span className="block text-sm text-white/55">{r.hint}</span>
              </span>
            </motion.button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          {t('auth.newToScore')}{' '}
          <Link to="/register" className="font-medium text-[#3A8F8B] hover:text-white">
            {t('auth.joinAcademy')}
          </Link>
        </p>
      </GlassAuthCard>
    )
  }

  // ---- Step 2: sign in as the selected role ----
  return (
    <GlassAuthCard image={authBg}>
      <img src={logoWhite} alt="SCORE" className="mx-auto h-9 w-auto object-contain" />

      <button
        type="button"
        onClick={() => setSelectedRole(null)}
        className="mt-6 flex items-center gap-1.5 text-sm text-white/55 hover:text-white"
      >
        <span aria-hidden="true" className="rtl:-scale-x-100">←</span> {t('auth.backToAccountType')}
      </button>

      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-lg" aria-hidden="true">
          {ROLE_ICON[selectedRole]}
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#3A8F8B]">{t('auth.roleNames.' + selectedRole)}</p>
          <h1 className="text-xl font-semibold text-white">{t('auth.signIn')}</h1>
        </div>
      </div>

      {!configured && (
        <p className="mt-4 rounded-2xl border border-white/15 bg-white/[0.06] p-3 text-sm text-white/70">
          {t('auth.notConfigured')}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
    </GlassAuthCard>
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
