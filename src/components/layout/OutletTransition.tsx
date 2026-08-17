import { useLocation, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Same fade+rise transition as RouteTransition, but for layouts that use
 * a nested <Outlet/> (the Parent/Coach/Admin/Player section-tab layouts).
 * Wrapping the Outlet directly — rather than the whole layout — means the
 * section tabs above it stay put and only the page content transitions
 * when switching tabs.
 */
export default function OutletTransition() {
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
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
