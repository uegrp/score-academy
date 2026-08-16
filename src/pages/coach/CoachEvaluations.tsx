import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, where } from '../../lib/collections'
import type { Player, SkillLevel } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import { Select, Textarea } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

const LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'developing', label: 'Developing' },
  { value: 'good', label: 'Good' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'excellent', label: 'Excellent' },
]

const TECHNICAL = ['passing', 'dribbling', 'ballControl', 'shooting', 'firstTouch'] as const
const PHYSICAL = ['speed', 'agility', 'stamina', 'strength'] as const
const MENTAL = ['discipline', 'confidence', 'teamwork', 'decisionMaking'] as const

const LABELS: Record<string, string> = {
  passing: 'Passing',
  dribbling: 'Dribbling',
  ballControl: 'Ball Control',
  shooting: 'Shooting',
  firstTouch: 'First Touch',
  speed: 'Speed',
  agility: 'Agility',
  stamina: 'Stamina',
  strength: 'Strength',
  discipline: 'Discipline',
  confidence: 'Confidence',
  teamwork: 'Teamwork',
  decisionMaking: 'Decision Making',
}

type Ratings = Record<string, SkillLevel>
const defaultRatings = (): Ratings =>
  Object.fromEntries([...TECHNICAL, ...PHYSICAL, ...MENTAL].map((k) => [k, 'developing' as SkillLevel]))

export default function CoachEvaluations() {
  const { appUser } = useAuth()
  const teamIds = appUser?.linkedTeamIds ?? []

  const { data: players } = useCollection<Player>(
    'players',
    teamIds.length ? [where('teamId', 'in', teamIds.slice(0, 10))] : [],
    [teamIds.join(',')]
  )

  const [playerId, setPlayerId] = useState('')
  const [ratings, setRatings] = useState<Ratings>(defaultRatings())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function setRating(key: string, value: SkillLevel) {
    setRatings((r) => ({ ...r, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!playerId || !appUser) return
    setSaving(true)
    setStatus(null)
    try {
      await createDoc('performanceEvaluations', {
        playerId,
        coachId: appUser.uid,
        date: Date.now(),
        technical: {
          passing: ratings.passing,
          dribbling: ratings.dribbling,
          ballControl: ratings.ballControl,
          shooting: ratings.shooting,
          firstTouch: ratings.firstTouch,
        },
        physical: {
          speed: ratings.speed,
          agility: ratings.agility,
          stamina: ratings.stamina,
          strength: ratings.strength,
        },
        mental: {
          discipline: ratings.discipline,
          confidence: ratings.confidence,
          teamwork: ratings.teamwork,
          decisionMaking: ratings.decisionMaking,
        },
        notes: notes.trim() || undefined,
      })
      setStatus({ type: 'success', message: 'Evaluation saved.' })
      setRatings(defaultRatings())
      setNotes('')
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  function Group({ title, keys }: { title: string; keys: readonly string[] }) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-pitch/60">{title}</p>
        <div className="mt-3 space-y-3">
          {keys.map((k) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <p className="text-sm text-pitch/80">{LABELS[k]}</p>
              <select
                value={ratings[k]}
                onChange={(e) => setRating(k, e.target.value as SkillLevel)}
                className="rounded-lg border border-line-soft bg-white px-3 py-1.5 text-sm text-pitch outline-none focus:border-grass"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">Performance evaluation</h1>
      <StatusBanner status={status} />

      {teamIds.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No teams assigned yet" />
        </div>
      ) : players.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No players to evaluate yet" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
          <Select
            label="Player"
            required
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Select player"
            options={players.map((p) => ({ value: p.id, label: p.fullName }))}
          />

          {playerId && (
            <>
              <div className="grid gap-6 rounded-card border border-line-soft bg-white p-5 sm:grid-cols-3">
                <Group title="Technical" keys={TECHNICAL} />
                <Group title="Physical" keys={PHYSICAL} />
                <Group title="Mental" keys={MENTAL} />
              </div>
              <Textarea
                label="Coaching notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations, focus areas for next session…"
              />
              <Button type="submit" loading={saving}>
                Save evaluation
              </Button>
            </>
          )}
        </form>
      )}
    </div>
  )
}
