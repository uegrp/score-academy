import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  image: string
  children: ReactNode
}

/**
 * Full-bleed premium photo background for auth screens (login/register),
 * with a dark gradient for legibility and the actual form content
 * floating in a light glass card on top — keeps the existing dark-on-light
 * text styling in each form working unchanged while giving the screen a
 * real "premium app" backdrop instead of a flat color.
 */
export default function AuthBackground({ image, children }: Props) {
  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-16">
      <img src={image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-pitch/85 via-pitch/55 to-pitch/90" />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm rounded-card bg-white/97 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
      >
        {children}
      </motion.div>
    </div>
  )
}
