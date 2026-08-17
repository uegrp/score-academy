import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, where } from '../../lib/collections'
import type { Player, SkillLevel } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import { Select, Textarea } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

const TECHNICAL = ['passing', 'dribbling', 'ballControl', 'shooting', 'firstTouch', 'defending'] as const
const PHYSICAL = ['speed', 'agility', 'stamina', 'strength'] as const
const MENTAL = ['discipline', 'confidence', 'teamwork', 'decisionMaking'] as const

type Ratings = Record<string, SkillLevel>
const defaultRatings = (): Ratings =>
  Object.fromEntries([...TECHNICAL, ...PHYSICAL, ...MENTAL].map((k) => [k, 'developing' as SkillLevel]))

export default function CoachEvaluations() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const teamIds = appUser?.linkedTeamIds ?? []

  const LEVELS: { value: SkillLevel; label: string }[] = [
    { value: 'beginner', label: t('coach.skillLevels.beginner') },
    { value: 'developing', label: t('coach.skillLevels.developing') },
    { value: 'good', label: t('coach.skillLevels.good') },
    { value: 'very_good', label: t('coach.skillLevels.very_good') },
    { value: 'excellent', label: t('coach.skillLevels.excellent') },
  ]

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
          defending: ratings.defending,
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
      setStatus({ type: 'success', message: t('coach.evaluationSaved') })
      setRatings(defaultRatings())
      setNotes('')
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('coach.failedToSave') })
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
              <p className="text-sm text-pitch/80">{t(`coach.attributes.${k}`)}</p>
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
      <h1 className="text-3xl text-pitch">{t('coach.evaluation')}</h1>
      <StatusBanner status={status} />

      {teamIds.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('emptyStates.noTeamsAssignedYet')} />
        </div>
      ) : players.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('emptyStates.noPlayersToEvaluate')} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
          <Select
            label={t('coach.selectPlayer')}
            required
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder={t('coach.selectPlayer')}
            options={players.map((p) => ({ value: p.id, label: p.fullName }))}
          />

          {playerId && (
            <>
              <div className="grid gap-6 rounded-card border border-line-soft bg-white p-5 sm:grid-cols-3">
                <Group title={t('coach.technical')} keys={TECHNICAL} />
                <Group title={t('coach.physical')} keys={PHYSICAL} />
                <Group title={t('coach.mental')} keys={MENTAL} />
              </div>
              <Textarea
                label={t('coach.coachingNotes')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('coach.notesPlaceholder')}
              />
              <Button type="submit" loading={saving}>
                {t('coach.saveEvaluation')}
              </Button>
            </>
          )}
        </form>
      )}
    </div>
  )
}
