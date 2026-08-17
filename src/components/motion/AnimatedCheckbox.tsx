import { motion } from 'framer-motion'

interface Props {
  checked: boolean
  onChange: () => void
  label?: string
}

/** A tap-friendly circular checkbox with a spring-animated checkmark pop — used for daily task completion. */
export default function AnimatedCheckbox({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      aria-label={label}
      className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full border-2 transition-colors ${
        checked ? 'border-grass bg-grass' : 'border-line bg-transparent'
      }`}
    >
      <motion.svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        initial={false}
        animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </button>
  )
}
