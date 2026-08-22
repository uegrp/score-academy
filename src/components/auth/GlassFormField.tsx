import { useState, type InputHTMLAttributes } from 'react'

const fieldBase =
  'w-full rounded-2xl border border-white/15 bg-white/[0.06] py-3 text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#3A8F8B] focus:bg-white/[0.09]'

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 5.2A11 11 0 0 1 12 5c7 0 11 7 11 7a13.5 13.5 0 0 1-3.15 3.86M6.6 6.6C4.2 8.1 2 12 2 12s2.7 5.4 8.06 6.7" />
    </svg>
  )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function GlassEmailField({ label, className = '', ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-white/55">{label}</span>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-white/45">
          <MailIcon />
        </span>
        <input type="email" className={`${fieldBase} ps-10 pe-4 ${className}`} {...rest} />
      </div>
    </label>
  )
}

export function GlassPasswordField({ label, className = '', ...rest }: FieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-white/55">{label}</span>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-white/45">
          <LockIcon />
        </span>
        <input type={visible ? 'text' : 'password'} className={`${fieldBase} ps-10 pe-11 ${className}`} {...rest} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 end-3.5 flex items-center text-white/45 transition-colors hover:text-white/80"
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </label>
  )
}
