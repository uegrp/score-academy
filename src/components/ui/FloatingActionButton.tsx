import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
  label: string
  disabled?: boolean
}

/**
 * Mobile-only FAB for a page's primary "create new" action — stays
 * reachable while scrolling a long list, unlike a button pinned to the
 * top of the page. Desktop keeps the regular header button instead,
 * since the sidebar layout doesn't have the same scroll-away problem.
 */
export default function FloatingActionButton({ onClick, label, disabled }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      whileHover={disabled ? undefined : { y: -2 }}
      className="fixed bottom-24 end-4 z-30 flex items-center gap-2 rounded-full bg-grass px-5 py-3.5 text-bone shadow-lg shadow-grass/30 disabled:opacity-50 lg:hidden"
    >
      <span className="text-lg leading-none" aria-hidden="true">
        +
      </span>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  )
}
