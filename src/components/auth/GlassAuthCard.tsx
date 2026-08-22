import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  image: string
  children: ReactNode
}

/**
 * Premium glassmorphism login card over a full-bleed photo background —
 * used only by the Login screens (the unified Login.tsx and AdminLogin's
 * RoleLoginForm), per the dedicated SCORE login redesign brief. The
 * Register screens intentionally keep the original light AuthBackground
 * / white-card treatment — this is a deliberately separate, darker
 * component so the two don't get coupled by accident.
 */
export default function GlassAuthCard({ image, children }: Props) {
  return (
    <div className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-4 py-12">
      <img src={image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center" />
      {/* Subtle navy overlay — deliberately not opaque, the training field/players/lights must stay visible. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06152F]/70 via-[#06152F]/30 to-[#06152F]/85" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm rounded-[2rem] border border-white/15 bg-[#0B2347]/55 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        {children}
      </motion.div>
    </div>
  )
}
