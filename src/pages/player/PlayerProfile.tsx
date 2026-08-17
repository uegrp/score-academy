import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { where } from '../../lib/collections'
import type { Player, Team } from '../../types'
import EmptyState from '../../components/ui/EmptyState'

export default function PlayerProfile() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const { data: players } = useCollection<Player>('players', appUser ? [where('playerUserId', '==', appUser.uid)] : [])
  const player = players[0]
  const { data: teams } = useCollection<Team>('teams')
  const team = teams.find((tm) => tm.id === player?.teamId)

  function age(dob: string) {
    const d = new Date(dob)
    if (isNaN(d.getTime())) return '—'
    return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  if (!player) {
    return (
      <div>
        <h1 className="text-3xl text-pitch">{t('parent.profile')}</h1>
        <div className="mt-6">
          <EmptyState title={t('player.notLinkedYet')} hint={t('player.notLinkedYetHint')} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('parent.profile')}</h1>

      <div className="mt-6 max-w-lg rounded-card border border-line-soft bg-white p-6">
        <div className="flex items-center gap-4">
          {player.photoUrl ? (
            <img src={player.photoUrl} alt={player.fullName} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-full bg-pitch text-xl font-bold text-gold-bright">
              {player.fullName.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-2xl font-semibold text-pitch">{player.fullName}</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                player.status === 'active' ? 'bg-grass/10 text-grass' : 'bg-warn/10 text-warn'
              }`}
            >
              {player.status === 'active' ? t('common.active') : player.status === 'pending' ? t('parent.pendingReview') : t('common.archived')}
            </span>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-y-4 text-sm">
          <Field label={t('parent.age')} value={String(age(player.dateOfBirth))} />
          <Field label={t('parent.position')} value={player.preferredPosition} />
          <Field label={t('parent.team')} value={team?.name ?? t('parent.notAssigned')} />
          <Field label={t('parent.level')} value={player.currentLevel} />
          <Field label={t('auth.nationality')} value={player.nationality} />
          <Field label={t('parent.joiningDate')} value={new Date(player.joiningDate).toLocaleDateString()} />
          {player.jerseyNumber && <Field label="#" value={String(player.jerseyNumber)} />}
          {player.previousClub && <Field label={t('parent.previousClub')} value={player.previousClub} />}
        </dl>

        <div className="mt-5 border-t border-line-soft pt-4">
          <p className="text-xs uppercase tracking-wide text-pitch/50">{t('parent.emergencyContact')}</p>
          <p className="mt-1 text-sm text-pitch/80">
            {player.emergencyContact.name} · {player.emergencyContact.phone}
          </p>
        </div>
      </div>
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
