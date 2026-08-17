import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface Props {
  value: number
  suffix?: string
  className?: string
}

/** Counts up from its previous value to `value` whenever it changes — used for dashboard stats so numbers feel alive instead of just appearing. */
export default function AnimatedNumber({ value, suffix = '', className }: Props) {
  const count = useMotionValue(0)
  const display = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`)

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.9, ease: 'easeOut' })
    return controls.stop
  }, [value, count])

  return <motion.span className={className}>{display}</motion.span>
}
