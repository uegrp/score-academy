import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, where } from '../../lib/collections'
import type { Match, Player, Team, MatchPlayerStat } from '../../types'
import EmptyState from '../ui/EmptyState'
import Button from '../ui/Button'
import { Input, Select } from '../ui/FormField'
import StatusBanner from '../ui/StatusBanner'

interface Props {
  /** Restrict to these teams' matches (coach). Omit for no restriction (admin). */
  allowedTeamIds?: string[]
}

type FormState = {
  goals: string
  assists: string
  shots: string
  shotsOnTarget: string
  passes: string
  successfulPasses: string
  keyPasses: string
  tackles: string
  interceptions: string
  ballRecoveries: string
  clearances: string
  blocks: string
  minutesPlayed: string
}

const emptyForm: FormState = {
  goals: '0',
  assists: '0',
  shots: '0',
  shotsOnTarget: '0',
  passes: '0',
  successfulPasses: '0',
  keyPasses: '0',
  tackles: '0',
  interceptions: '0',
  ballRecoveries: '0',
  clearances: '0',
  blocks: '0',
  minutesPlayed: '0',
}

export default function MatchStatsEditor({ allowedTeamIds }: Props) {
  const { t } = useTranslation()
  const { data: allMatches } = useCollection<Match>('matches')
  const { data: teams } = useCollection<Team>('teams')

  const matches = allowedTeamIds ? allMatches.filter((m) => allowedTeamIds.includes(m.teamId)) : allMatches

  const [matchId, setMatchId] = useState('')
  const match = matches.find((m) => m.id === matchId)

  const { data: players } = useCollection<Player>(
    'players',
    match ? [where('teamId', '==', match.teamId)] : [],
    [match?.teamId]
  )

  const [playerId, setPlayerId] = useState('')
  const { data: existingStats } = useCollection<MatchPlayerStat>(
    'matchPlayerStats',
    matchId ? [where('matchId', '==', matchId)] : [],
    [matchId]
  )
  const existingForPlayer = existingStats.find((s) => s.playerId === playerId)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function selectPlayer(id: string) {
    setPlayerId(id)
    const existing = existingStats.find((s) => s.playerId === id)
    if (existing) {
      setForm({
        goals: String(existing.goals),
        assists: String(existing.assists),
        shots: String(existing.shots),
        shotsOnTarget: String(existing.shotsOnTarget),
        passes: String(existing.passes),
        successfulPasses: String(existing.successfulPasses),
        keyPasses: String(existing.keyPasses),
        tackles: String(existing.tackles),
        interceptions: String(existing.interceptions),
        ballRecoveries: String(existing.ballRecoveries),
        clearances: String(existing.clearances),
        blocks: String(existing.blocks),
        minutesPlayed: String(existing.minutesPlayed),
      })
    } else {
      setForm(emptyForm)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!matchId || !playerId) return
    setSaving(true)
    setStatus(null)
    try {
      const payload = {
        matchId,
        playerId,
        goals: Number(form.goals) || 0,
        assists: Number(form.assists) || 0,
        shots: Number(form.shots) || 0,
        shotsOnTarget: Number(form.shotsOnTarget) || 0,
        passes: Number(form.passes) || 0,
        successfulPasses: Number(form.successfulPasses) || 0,
        keyPasses: Number(form.keyPasses) || 0,
        tackles: Number(form.tackles) || 0,
        interceptions: Number(form.interceptions) || 0,
        ballRecoveries: Number(form.ballRecoveries) || 0,
        clearances: Number(form.clearances) || 0,
        blocks: Number(form.blocks) || 0,
        minutesPlayed: Number(form.minutesPlayed) || 0,
      }
      if (existingForPlayer) {
        await updateDocById('matchPlayerStats', existingForPlayer.id, payload)
      } else {
        await createDoc('matchPlayerStats', payload)
      }
      setStatus({ type: 'success', message: t('admin.matchStatsPage.saved') })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.somethingWrong') })
    } finally {
      setSaving(false)
    }
  }

  const FIELDS: { key: keyof FormState; label: string }[] = [
    { key: 'minutesPlayed', label: t('admin.matchStatsPage.minutesPlayed') },
    { key: 'goals', label: t('admin.matchStatsPage.goals') },
    { key: 'assists', label: t('admin.matchStatsPage.assists') },
    { key: 'shots', label: t('admin.matchStatsPage.shots') },
    { key: 'shotsOnTarget', label: t('admin.matchStatsPage.shotsOnTarget') },
    { key: 'passes', label: t('admin.matchStatsPage.passes') },
    { key: 'successfulPasses', label: t('admin.matchStatsPage.successfulPasses') },
    { key: 'keyPasses', label: t('admin.matchStatsPage.keyPasses') },
    { key: 'tackles', label: t('admin.matchStatsPage.tackles') },
    { key: 'interceptions', label: t('admin.matchStatsPage.interceptions') },
    { key: 'ballRecoveries', label: t('admin.matchStatsPage.ballRecoveries') },
    { key: 'clearances', label: t('admin.matchStatsPage.clearances') },
    { key: 'blocks', label: t('admin.matchStatsPage.blocks') },
  ]

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('admin.matchStatsPage.title')}</h1>
      <StatusBanner status={status} />

      {matches.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('emptyStates.noMatches')} />
        </div>
      ) : (
        <div className="mt-6 max-w-2xl space-y-4">
          <Select
            label={t('admin.matchStatsPage.selectMatch')}
            value={matchId}
            onChange={(e) => {
              setMatchId(e.target.value)
              setPlayerId('')
              setForm(emptyForm)
            }}
            placeholder={t('admin.matchStatsPage.selectMatch')}
            options={[...matches]
              .sort((a, b) => b.date - a.date)
              .map((m) => ({
                value: m.id,
                label: `${teams.find((tm) => tm.id === m.teamId)?.name ?? ''} vs ${m.opponent} · ${new Date(m.date).toLocaleDateString()}`,
              }))}
          />

          {matchId && (
            <>
              {players.length === 0 ? (
                <EmptyState title={t('emptyStates.noPlayersInTeam')} />
              ) : (
                <Select
                  label={t('coach.selectPlayer')}
                  value={playerId}
                  onChange={(e) => selectPlayer(e.target.value)}
                  placeholder={t('coach.selectPlayer')}
                  options={players.map((p) => ({ value: p.id, label: p.fullName }))}
                />
              )}

              {playerId && (
                <form onSubmit={handleSubmit} className="rounded-card border border-line-soft bg-white p-5">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {FIELDS.map((f) => (
                      <Input
                        key={f.key}
                        label={f.label}
                        type="number"
                        min={0}
                        value={form[f.key]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      />
                    ))}
                  </div>
                  <Button type="submit" loading={saving} className="mt-4">
                    {t('common.save')}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
