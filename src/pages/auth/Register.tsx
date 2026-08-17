import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { createDoc } from '../../lib/collections'
import type { Registration } from '../../types'

interface FormState {
  playerFullName: string
  dateOfBirth: string
  gender: string
  nationality: string
  preferredPosition: string
  currentLevel: string
  parentName: string
  parentPhone: string
  parentEmail: string
  relationship: string
  previousClub: string
  experience: string
  medicalNotes: string
  emergencyContactName: string
  emergencyContactPhone: string
  accountPassword: string
}

const EMPTY: FormState = {
  playerFullName: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  preferredPosition: '',
  currentLevel: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  relationship: '',
  previousClub: '',
  experience: '',
  medicalNotes: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  accountPassword: '',
}

const REQUIRED: (keyof FormState)[] = [
  'playerFullName',
  'dateOfBirth',
  'gender',
  'nationality',
  'preferredPosition',
  'currentLevel',
  'parentName',
  'parentPhone',
  'parentEmail',
  'relationship',
  'emergencyContactName',
  'emergencyContactPhone',
  'accountPassword',
]

export default function Register() {
  const { t } = useTranslation()
  const { signUp, configured } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    for (const key of REQUIRED) {
      if (!form[key].trim()) next[key] = t('auth.errors.required')
    }
    if (form.parentEmail && !/^\S+@\S+\.\S+$/.test(form.parentEmail)) {
      next.parentEmail = t('auth.errors.invalidEmail')
    }
    if (form.accountPassword && form.accountPassword.length < 8) {
      next.accountPassword = t('auth.errors.passwordLength')
    }
    if (form.dateOfBirth) {
      const age = ageFromDob(form.dateOfBirth)
      if (age < 4 || age > 19) next.dateOfBirth = t('auth.errors.invalidDob')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      // 1. Create the parent's account so they can track this registration.
      await signUp(form.parentEmail, form.accountPassword, form.parentName, 'parent')

      // 2. File the registration for admin review — this does not
      // create an active Player record yet; admins approve first.
      const registration: Omit<Registration, 'id'> = {
        player: {
          fullName: form.playerFullName,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender as 'male' | 'female',
          nationality: form.nationality,
          preferredPosition: form.preferredPosition,
          currentLevel: form.currentLevel,
        },
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        parentEmail: form.parentEmail,
        relationship: form.relationship,
        previousClub: form.previousClub || undefined,
        experience: form.experience || undefined,
        medicalNotes: form.medicalNotes || undefined,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        submittedAt: Date.now(),
        status: 'pending',
      }
      await createDoc('registrations', registration)
      setSuccess(true)
    } catch (err) {
      // Logged for debugging — never shown verbatim to the user, but this
      // is what to check in the browser console (F12) if registration
      // fails: the Firebase error code here tells you the exact cause
      // (e.g. auth/operation-not-allowed means Email/Password sign-in
      // isn't enabled in Firebase Console → Authentication → Sign-in
      // method; auth/unauthorized-domain means the current domain isn't
      // in Authentication → Settings → Authorized domains).
      console.error('[SCORE] Registration failed:', err)
      setSubmitError(err instanceof Error ? mapError(err.message, t) : t('auth.errors.registrationGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-bone px-4 py-16">
        <div className="max-w-md rounded-card border border-grass/30 bg-pitch-soft p-8 text-center">
          <p className="eyebrow text-grass-bright">{t('auth.successEyebrow')}</p>
          <h1 className="mt-3 text-3xl text-bone">
            {t('auth.successTitle', { name: form.playerFullName.split(' ')[0] })}
          </h1>
          <p className="mt-3 text-sm text-bone-dim">{t('auth.successBody')}</p>
          <Button className="mt-6" onClick={() => navigate('/parent')}>
            {t('auth.goToDashboard')}
          </Button>
        </div>
      </div>
    )
  }

  const POSITIONS = [
    { value: 'Goalkeeper', label: t('auth.goalkeeper') },
    { value: 'Defender', label: t('auth.defender') },
    { value: 'Midfielder', label: t('auth.midfielder') },
    { value: 'Forward', label: t('auth.forward') },
    { value: 'Not sure yet', label: t('auth.notSurePosition') },
  ]
  const LEVELS = [
    { value: 'New to football', label: t('auth.newToFootball') },
    { value: 'Recreational', label: t('auth.recreational') },
    { value: 'Club experience', label: t('auth.clubExperience') },
    { value: 'Competitive/Academy', label: t('auth.competitiveAcademy') },
  ]

  return (
    <div className="bg-bone px-4 py-16">
      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-2xl">
        <p className="eyebrow text-grass">{t('auth.registerEyebrow')}</p>
        <h1 className="mt-2 text-4xl text-pitch">{t('auth.registerTitle')}</h1>
        <p className="mt-2 text-sm text-pitch/70">{t('auth.registerSubtitle')}</p>

        {!configured && (
          <p className="mt-4 rounded-card border border-warn/40 bg-warn/10 p-3 text-sm text-pitch">
            {t('auth.registerNotConfigured')}
          </p>
        )}

        <Section title={t('auth.playerInfoSection')}>
          <Field label={t('auth.playerFullName')} error={errors.playerFullName}>
            <input className="input" value={form.playerFullName} onChange={(e) => update('playerFullName', e.target.value)} />
          </Field>
          <Row>
            <Field label={t('auth.dateOfBirth')} error={errors.dateOfBirth}>
              <input type="date" className="input" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
            </Field>
            <Field label={t('auth.gender')} error={errors.gender}>
              <select className="input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="">{t('auth.selectOption')}</option>
                <option value="male">{t('auth.male')}</option>
                <option value="female">{t('auth.female')}</option>
              </select>
            </Field>
          </Row>
          <Row>
            <Field label={t('auth.nationality')} error={errors.nationality}>
              <input className="input" value={form.nationality} onChange={(e) => update('nationality', e.target.value)} />
            </Field>
            <Field label={t('auth.preferredPosition')} error={errors.preferredPosition}>
              <select className="input" value={form.preferredPosition} onChange={(e) => update('preferredPosition', e.target.value)}>
                <option value="">{t('auth.selectOption')}</option>
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
          </Row>
          <Field label={t('auth.currentLevel')} error={errors.currentLevel}>
            <select className="input" value={form.currentLevel} onChange={(e) => update('currentLevel', e.target.value)}>
              <option value="">{t('auth.selectOption')}</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title={t('auth.parentInfoSection')}>
          <Field label={t('auth.parentName')} error={errors.parentName}>
            <input className="input" value={form.parentName} onChange={(e) => update('parentName', e.target.value)} />
          </Field>
          <Row>
            <Field label={t('auth.phone')} error={errors.parentPhone}>
              <input type="tel" className="input" value={form.parentPhone} onChange={(e) => update('parentPhone', e.target.value)} />
            </Field>
            <Field label={t('auth.email')} error={errors.parentEmail}>
              <input type="email" className="input" value={form.parentEmail} onChange={(e) => update('parentEmail', e.target.value)} />
            </Field>
          </Row>
          <Field label={t('auth.relationship')} error={errors.relationship}>
            <input
              className="input"
              placeholder={t('auth.relationshipPlaceholder')}
              value={form.relationship}
              onChange={(e) => update('relationship', e.target.value)}
            />
          </Field>
          <Field label={t('auth.createPassword')} error={errors.accountPassword}>
            <input type="password" className="input" value={form.accountPassword} onChange={(e) => update('accountPassword', e.target.value)} />
          </Field>
        </Section>

        <Section title={t('auth.additionalInfoSection')}>
          <Field label={`${t('auth.previousClub')} (${t('common.optional')})`}>
            <input className="input" value={form.previousClub} onChange={(e) => update('previousClub', e.target.value)} />
          </Field>
          <Field label={`${t('auth.experience')} (${t('common.optional')})`}>
            <textarea className="input" value={form.experience} onChange={(e) => update('experience', e.target.value)} />
          </Field>
          <Field label={`${t('auth.medicalNotes')} (${t('common.optional')})`}>
            <textarea className="input" value={form.medicalNotes} onChange={(e) => update('medicalNotes', e.target.value)} />
          </Field>
          <Row>
            <Field label={t('auth.emergencyContactName')} error={errors.emergencyContactName}>
              <input className="input" value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} />
            </Field>
            <Field label={t('auth.emergencyContactPhone')} error={errors.emergencyContactPhone}>
              <input type="tel" className="input" value={form.emergencyContactPhone} onChange={(e) => update('emergencyContactPhone', e.target.value)} />
            </Field>
          </Row>
        </Section>

        {submitError && <p className="mt-4 text-sm text-danger">{submitError}</p>}

        <Button type="submit" size="lg" loading={submitting} disabled={!configured} className="mt-6 w-full">
          {t('auth.submitRegistration')}
        </Button>

        <p className="mt-6 text-center text-sm text-pitch/70">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-medium text-grass hover:text-grass-bright">
            {t('auth.signIn')}
          </Link>
        </p>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-10 border-t border-line pt-6">
      <legend className="eyebrow -mt-9 bg-bone pe-3 text-pitch/70">{title}</legend>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow text-pitch/60">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  )
}

function ageFromDob(dob: string) {
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return -1
  const diff = Date.now() - birth.getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

function mapError(message: string, t: (key: string) => string) {
  if (message.includes('email-already-in-use')) return t('auth.errors.emailInUse')
  if (message.includes('weak-password')) return t('auth.errors.weakPassword')
  if (message.includes('invalid-email')) return t('auth.errors.invalidEmailAuth')
  if (message.includes('operation-not-allowed')) return t('auth.errors.operationNotAllowed')
  if (message.includes('unauthorized-domain')) return t('auth.errors.unauthorizedDomain')
  if (message.includes('network-request-failed')) return t('auth.errors.networkFailed')
  if (message.includes('permission-denied')) return t('auth.errors.permissionDenied')
  return t('auth.errors.registrationGeneric')
}
