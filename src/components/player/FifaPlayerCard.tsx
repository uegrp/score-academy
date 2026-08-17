import { motion } from 'framer-motion'
import type { FifaAttributes } from '../../lib/fifaCard'
import AnimatedNumber from '../motion/AnimatedNumber'

interface Props {
  name: string
  position: string
  teamName?: string
  jerseyNumber?: number
  photoUrl?: string
  attributes: FifaAttributes
}

/**
 * The player's personal FIFA-style card — the centerpiece of their
 * dashboard. Every number here comes from computeFifaAttributes() against
 * their latest real coach evaluation; nothing is hardcoded, so the card
 * changes the moment a new evaluation is submitted.
 */
export default function FifaPlayerCard({ name, position, teamName, jerseyNumber, photoUrl, attributes }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="card-shine glow-red relative w-full max-w-sm overflow-hidden rounded-card border border-gold/30 bg-gradient-to-br from-pitch via-pitch to-grass/25 p-6"
    >
      {/* Soft radial glow behind the rating — purely decorative, ignored by screen readers. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 start-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gold/25 blur-3xl"
      />

      <div className="relative flex items-start justify-between">
        <div className="text-center">
          <AnimatedNumber value={attributes.overall} className="stat-figure block text-5xl font-bold text-gold-bright" />
          <p className="eyebrow text-bone-dim">OVR</p>
        </div>
        {typeof jerseyNumber === 'number' && (
          <p className="stat-figure text-3xl font-bold text-bone-dim">#{jerseyNumber}</p>
        )}
      </div>

      <div className="relative mt-4 flex flex-col items-center">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="h-24 w-24 rounded-full border-2 border-gold/60 object-cover shadow-lg" />
        ) : (
          <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-gold/60 bg-pitch-soft text-3xl font-bold text-gold-bright shadow-lg">
            {name.charAt(0)}
          </div>
        )}
        <p className="mt-3 font-display text-2xl leading-tight text-bone">{name}</p>
        <p className="eyebrow text-grass-bright">
          {position}
          {teamName ? ` · ${teamName}` : ''}
        </p>
      </div>

      <div className="relative mx-2 mt-5 border-t border-line-soft" />

      <div className="relative grid grid-cols-3 gap-y-4 px-2 py-5 text-center">
        <Stat code="PAC" value={attributes.pac} />
        <Stat code="SHO" value={attributes.sho} />
        <Stat code="PAS" value={attributes.pas} />
        <Stat code="DRI" value={attributes.dri} />
        <Stat code="DEF" value={attributes.def} />
        <Stat code="PHY" value={attributes.phy} />
      </div>
    </motion.div>
  )
}

function Stat({ code, value }: { code: string; value: number }) {
  return (
    <div>
      <AnimatedNumber value={value} className="stat-figure block text-xl font-semibold text-bone" />
      <p className="eyebrow text-gold-bright">{code}</p>
    </div>
  )
}
