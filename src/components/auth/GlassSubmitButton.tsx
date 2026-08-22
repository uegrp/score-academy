import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  type?: 'submit' | 'button'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: ReactNode
}

export default function GlassSubmitButton({ type = 'submit', onClick, disabled, loading, children }: Props) {
  const isDisabled = disabled || loading
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      whileHover={isDisabled ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3A8F8B] to-[#2E7672] py-3.5 font-display text-base uppercase tracking-wide text-white shadow-[0_8px_24px_-6px_rgba(58,143,139,0.65)] transition-opacity disabled:opacity-50"
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />}
      {children}
    </motion.button>
  )
}
