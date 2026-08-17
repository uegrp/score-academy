import type { PerformanceEvaluation, SkillLevel } from '../types'

// Maps our qualitative coaching scale to a 0-99 FIFA-style number. These
// midpoints are a deliberate design choice (not a guess): "excellent" caps
// below 99 so a real player's card still has room to grow, matching how
// professional rating systems reserve the top of the scale.
const SKILL_SCORE: Record<SkillLevel, number> = {
  beginner: 45,
  developing: 58,
  good: 70,
  very_good: 82,
  excellent: 92,
}

export function skillToScore(level: SkillLevel): number {
  return SKILL_SCORE[level]
}

export interface FifaAttributes {
  pac: number
  sho: number
  pas: number
  dri: number
  def: number
  phy: number
  overall: number
}

/**
 * Computes the classic FIFA-card six attributes (PAC/SHO/PAS/DRI/DEF/PHY)
 * plus an overall rating from a single real evaluation. Every number here
 * is derived — nothing is hardcoded, so a new coach evaluation changes
 * the card automatically the next time this runs against it.
 */
export function computeFifaAttributes(evaluation: PerformanceEvaluation): FifaAttributes {
  const pac = skillToScore(evaluation.physical.speed)
  const sho = skillToScore(evaluation.technical.shooting)
  const pas = skillToScore(evaluation.technical.passing)
  const dri = skillToScore(evaluation.technical.dribbling)
  const def = skillToScore(evaluation.technical.defending)
  const phy = Math.round(
    (skillToScore(evaluation.physical.stamina) +
      skillToScore(evaluation.physical.strength) +
      skillToScore(evaluation.physical.agility)) /
      3
  )
  const overall = Math.round((pac + sho + pas + dri + def + phy) / 6)
  return { pac, sho, pas, dri, def, phy, overall }
}
