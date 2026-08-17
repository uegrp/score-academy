import AnimatedNumber from '../motion/AnimatedNumber'

interface Props {
  label: string
  value: string | number
  suffix?: string
  highlight?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZES: Record<string, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
}

/** Numeric values count up on mount/change; string values (team names, levels) render as plain text. */
export default function StatCard({ label, value, suffix = '', highlight, size = 'md' }: Props) {
  return (
    <div className={`rounded-card border p-4 ${highlight ? 'border-warn/50 bg-warn/5' : 'border-line-soft bg-white'}`}>
      {typeof value === 'number' ? (
        <AnimatedNumber value={value} suffix={suffix} className={`stat-figure block ${SIZES[size]} text-pitch`} />
      ) : (
        <p className={`stat-figure ${SIZES[size]} text-pitch`}>{value}</p>
      )}
      <p className="mt-1 text-xs uppercase tracking-wide text-pitch/60">{label}</p>
    </div>
  )
}
