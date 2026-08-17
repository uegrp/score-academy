import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 font-display uppercase tracking-wide rounded-full transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<string, string> = {
  primary: 'bg-grass text-bone hover:bg-grass-bright',
  secondary: 'bg-bone text-pitch border border-pitch hover:bg-bone-dim',
  ghost: 'bg-transparent text-bone border border-line-soft hover:border-bone-dim',
  danger: 'bg-danger text-bone hover:opacity-90',
}

const sizes: Record<string, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-6 py-3',
  lg: 'text-lg px-8 py-4',
}

/** Every button gets a subtle spring press + lift — this is the app's core micro-interaction, felt on every tap throughout SCORE. */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <motion.button
      whileTap={disabled || loading ? undefined : { scale: 0.96 }}
      whileHover={disabled || loading ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </motion.button>
  )
}
