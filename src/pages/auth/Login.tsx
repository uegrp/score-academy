import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

export default function Login() {
  const { signIn, configured } = useAuth()
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
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? mapError(err.message) : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-bone px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-grass">Welcome back</p>
        <h1 className="mt-2 text-4xl text-pitch">Sign in</h1>

        {!configured && (
          <p className="mt-4 rounded-card border border-warn/40 bg-warn/10 p-3 text-sm text-pitch">
            Firebase isn't configured yet — add your project keys to <code>.env.local</code> to enable sign in.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field label="Email">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Password">
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
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-pitch/70">
          New to SCORE?{' '}
          <Link to="/register" className="font-medium text-grass hover:text-grass-bright">
            Join the academy
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

function mapError(message: string) {
  if (message.includes('invalid-credential') || message.includes('wrong-password')) {
    return 'Incorrect email or password.'
  }
  if (message.includes('user-not-found')) return 'No account found with that email.'
  if (message.includes('too-many-requests')) return 'Too many attempts. Try again shortly.'
  return 'Sign in failed. Please try again.'
}
