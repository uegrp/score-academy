import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import type { Player, Team } from '../../types'
import { where } from '../../lib/collections'
import EmptyState from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormField'

export default function ParentProfile() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const { data: players } = useCollection<Player>('players', appUser ? [where('parentUserIds', 'array-contains', appUser.uid)] : [])
  const { data: teams } = useCollection<Team>('teams')
  const [playerId, setPlayerId] = useState('')

  const activePlayer = players.find((p) => p.id === playerId) ?? players[0]
  const team = teams.find((tm) => tm.id === activePlayer?.teamId)

  function age(dob: string) {
    const d = new Date(dob)
    if (isNaN(d.getTime())) return '—'
    const diff = Date.now() - d.getTime()
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('parent.profile')}</h1>

      {players.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('emptyStates.noPlayerLinked')} hint={t('emptyStates.noPlayerLinkedHint')} />
        </div>
      ) : (
        <>
          {players.length > 1 && (
            <div className="mt-5 max-w-xs">
              <Select
                label={t('parent.player')}
                value={playerId || players[0].id}
                onChange={(e) => setPlayerId(e.target.value)}
                options={players.map((p) => ({ value: p.id, label: p.fullName }))}
              />
            </div>
          )}

          {activePlayer && (
            <div className="mt-6 max-w-lg rounded-card border border-line-soft bg-white p-6">
              <p className="text-2xl font-semibold text-pitch">{activePlayer.fullName}</p>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  activePlayer.status === 'active' ? 'bg-grass/10 text-grass' : 'bg-warn/10 text-warn'
                }`}
              >
                {activePlayer.status === 'active'
                  ? t('common.active')
                  : activePlayer.status === 'pending'
                    ? t('parent.pendingReview')
                    : t('common.archived')}
              </span>

              <dl className="mt-5 grid grid-cols-2 gap-y-4 text-sm">
                <Field label={t('parent.age')} value={String(age(activePlayer.dateOfBirth))} />
                <Field label={t('parent.position')} value={activePlayer.preferredPosition} />
                <Field label={t('parent.team')} value={team?.name ?? t('parent.notAssigned')} />
                <Field label={t('parent.level')} value={activePlayer.currentLevel} />
                <Field label={t('auth.nationality')} value={activePlayer.nationality} />
                <Field label={t('parent.joiningDate')} value={new Date(activePlayer.joiningDate).toLocaleDateString()} />
                {activePlayer.previousClub && <Field label={t('parent.previousClub')} value={activePlayer.previousClub} />}
              </dl>

              <div className="mt-5 border-t border-line-soft pt-4">
                <p className="text-xs uppercase tracking-wide text-pitch/50">{t('parent.emergencyContact')}</p>
                <p className="mt-1 text-sm text-pitch/80">
                  {activePlayer.emergencyContact.name} · {activePlayer.emergencyContact.phone}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-pitch/50">{label}</dt>
      <dd className="mt-0.5 font-medium text-pitch">{value}</dd>
    </div>
  )
}
