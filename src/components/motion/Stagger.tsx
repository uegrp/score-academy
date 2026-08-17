import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

/** Wraps a grid/list of cards so they animate in with a subtle stagger instead of appearing all at once. */
export function StaggerContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" animate="show">
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
