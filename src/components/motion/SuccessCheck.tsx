import { motion } from 'framer-motion'

export default function SuccessCheck({ size = 72 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="mx-auto grid place-items-center rounded-full bg-grass text-bone"
      style={{ width: size, height: size }}
    >
      <motion.svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <motion.path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        />
      </motion.svg>
    </motion.div>
  )
}
