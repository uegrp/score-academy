import type { SkillLevel } from '../../types'

const LEVEL_SCORE: Record<SkillLevel, number> = {
  beginner: 40,
  developing: 55,
  good: 68,
  very_good: 80,
  excellent: 92,
}

const LEVEL_LABEL: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  developing: 'Developing',
  good: 'Good',
  very_good: 'Very Good',
  excellent: 'Excellent',
}

export interface AttributeCardStat {
  code: string // e.g. "PAC"
  label: string // e.g. "Pace"
  level: SkillLevel
}

interface Props {
  name: string
  subtitle?: string // position / team
  stats: AttributeCardStat[] // exactly 6 for the classic layout
  variant?: 'gold' | 'dark'
  photoUrl?: string
}

/**
 * SCORE's signature UI element. Echoes the club's own attribute-card
 * reference: six stats split left/right beneath a name band. Used for
 * coach performance evaluations, and for program tiers on the landing
 * page, so the "player card" language recurs across the product.
 */
export default function PlayerAttributeCard({ name, subtitle, stats, variant = 'dark', photoUrl }: Props) {
  const left = stats.slice(0, 3)
  const right = stats.slice(3, 6)

  const isGold = variant === 'gold'

  return (
    <div
      className={`relative flex w-full max-w-xs flex-col overflow-hidden rounded-card border ${
        isGold ? 'border-gold/40 bg-gradient-to-b from-gold/25 via-pitch-soft to-pitch' : 'border-line-soft bg-pitch-soft'
      }`}
    >
      <div className="flex items-center gap-3 px-5 pt-5">
        {photoUrl && (
          <img
            src={photoUrl}
            alt={name}
            className="h-12 w-12 rounded-full border border-line-soft object-cover"
          />
        )}
        <div>
          <p className="font-display text-xl leading-tight text-bone">{name}</p>
          {subtitle && <p className="eyebrow text-line">{subtitle}</p>}
        </div>
      </div>

      <div className="mx-5 mt-4 border-t border-line-soft" />

      <div className="grid grid-cols-2 gap-x-4 px-5 py-5">
        <ul className="space-y-2">
          {left.map((s) => (
            <StatRow key={s.code} stat={s} gold={isGold} />
          ))}
        </ul>
        <ul className="space-y-2 border-l border-line-soft pl-4">
          {right.map((s) => (
            <StatRow key={s.code} stat={s} gold={isGold} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function StatRow({ stat, gold }: { stat: AttributeCardStat; gold: boolean }) {
  return (
    <li className="flex items-center justify-between gap-2" title={LEVEL_LABEL[stat.level]}>
      <span className="stat-figure text-lg font-semibold text-bone">{LEVEL_SCORE[stat.level]}</span>
      <span className={`eyebrow ${gold ? 'text-gold-bright' : 'text-line'}`}>{stat.code}</span>
    </li>
  )
}
