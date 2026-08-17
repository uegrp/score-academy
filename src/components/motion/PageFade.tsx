import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Wraps a page's content with a smooth fade + rise entrance. Framer Motion respects prefers-reduced-motion automatically. */
export default function PageFade({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
