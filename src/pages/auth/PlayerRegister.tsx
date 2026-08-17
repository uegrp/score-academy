import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import logo from '../../assets/images/score-logo.png'

export default function PlayerRegister() {
  const { t } = useTranslation()
  const { signUp, configured } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp(email, password, fullName, 'player')
      setSuccess(true)
    } catch (err) {
      console.error('[SCORE] Player account creation failed:', err)
      setError(err instanceof Error ? mapError(err.message, t) : t('auth.errors.registrationGeneric'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-bone px-4 py-16">
        <div className="max-w-md rounded-card border border-grass/30 bg-pitch-soft p-8 text-center">
          <img src={logo} alt="SCORE" className="mx-auto h-9 w-auto rounded-md bg-bone px-2 py-1 object-contain" />
          <p className="mt-6 eyebrow text-grass-bright">{t('player.registerSuccessEyebrow')}</p>
          <h1 className="mt-3 text-2xl text-bone">{t('player.registerSuccessTitle')}</h1>
          <p className="mt-3 text-sm text-bone-dim">{t('player.registerSuccessBody')}</p>
          <Button className="mt-6" onClick={() => navigate('/player-login')}>
            {t('auth.signIn')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-bone px-4 py-16">
      <div className="w-full max-w-sm">
        <img src={logo} alt="SCORE" className="mx-auto h-10 w-auto object-contain" />
        <p className="mt-8 eyebrow text-grass">{t('player.registerEyebrow')}</p>
        <h1 className="mt-2 text-4xl text-pitch">{t('player.registerTitle')}</h1>
        <p className="mt-2 text-sm text-pitch/70">{t('player.registerSubtitle')}</p>

        {!configured && (
          <p className="mt-4 rounded-card border border-warn/40 bg-warn/10 p-3 text-sm text-pitch">
            {t('auth.registerNotConfigured')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field label={t('auth.playerFullName')}>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
          </Field>
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
          <Field label={t('auth.createPassword')}>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </Field>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" loading={loading} className="mt-2 w-full" disabled={!configured}>
            {t('player.createAccount')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-pitch/70">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/player-login" className="font-medium text-grass hover:text-grass-bright">
            {t('auth.signIn')}
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

function mapError(message: string, t: (key: string) => string) {
  if (message.includes('email-already-in-use')) return t('auth.errors.emailInUse')
  if (message.includes('weak-password')) return t('auth.errors.weakPassword')
  if (message.includes('invalid-email')) return t('auth.errors.invalidEmailAuth')
  return t('auth.errors.registrationGeneric')
}
