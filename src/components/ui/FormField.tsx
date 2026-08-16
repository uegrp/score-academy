import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

const fieldBase =
  'mt-1.5 w-full rounded-xl border border-line-soft bg-white px-3.5 py-2.5 text-pitch outline-none transition-colors focus:border-grass disabled:opacity-50'

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-pitch/80">
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  )
}

interface FieldWrapProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

export function FieldWrap({ label, required, error, children }: FieldWrapProps) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, required, className = '', ...rest }: InputProps) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <input className={`${fieldBase} ${className}`} required={required} {...rest} />
    </FieldWrap>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function Textarea({ label, error, required, className = '', ...rest }: TextareaProps) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <textarea className={`${fieldBase} min-h-[6rem] resize-y ${className}`} required={required} {...rest} />
    </FieldWrap>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, required, options, placeholder, className = '', ...rest }: SelectProps) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <select className={`${fieldBase} ${className}`} required={required} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
}
