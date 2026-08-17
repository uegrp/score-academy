import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Wraps page content so navigating between routes gets a smooth fade +
 * rise instead of an instant hard cut. Deliberately direction-agnostic
 * (not a horizontal slide) so it looks identical and correct in both
 * RTL and LTR without needing directional logic per route.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
