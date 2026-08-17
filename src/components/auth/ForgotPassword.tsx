import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const { resetPassword } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await resetPassword(email)
      setStatus('sent')
    } catch (err) {
      console.error('[SCORE] Password reset failed:', err)
      setStatus('error')
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-pitch/60 hover:text-pitch">
        {t('auth.forgotPassword')}
      </button>
    )
  }

  if (status === 'sent') {
    return <p className="text-sm text-grass">{t('auth.resetEmailSent')}</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('auth.email')}
        className="input"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={status === 'sending'}>
          {t('auth.sendResetLink')}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(false)}>
          {t('common.cancel')}
        </Button>
      </div>
      {status === 'error' && <p className="text-sm text-danger">{t('auth.errors.resetFailed')}</p>}
    </form>
  )
}
