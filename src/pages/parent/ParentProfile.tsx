import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import type { Player, Team } from '../../types'
import { where } from '../../lib/collections'
import EmptyState from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormField'

export default function ParentProfile() {
  const { appUser } = useAuth()
  const { data: players } = useCollection<Player>('players', appUser ? [where('parentUserId', '==', appUser.uid)] : [])
  const { data: teams } = useCollection<Team>('teams')
  const [playerId, setPlayerId] = useState('')

  const activePlayer = players.find((p) => p.id === playerId) ?? players[0]
  const team = teams.find((t) => t.id === activePlayer?.teamId)

  function age(dob: string) {
    const d = new Date(dob)
    if (isNaN(d.getTime())) return '—'
    const diff = Date.now() - d.getTime()
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">Player profile</h1>

      {players.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No player linked yet" hint="Once your registration is approved, the profile appears here." />
        </div>
      ) : (
        <>
          {players.length > 1 && (
            <div className="mt-5 max-w-xs">
              <Select
                label="Player"
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
                {activePlayer.status === 'active' ? 'Active' : activePlayer.status === 'pending' ? 'Pending review' : 'Archived'}
              </span>

              <dl className="mt-5 grid grid-cols-2 gap-y-4 text-sm">
                <Field label="Age" value={String(age(activePlayer.dateOfBirth))} />
                <Field label="Position" value={activePlayer.preferredPosition} />
                <Field label="Team" value={team?.name ?? 'Not assigned'} />
                <Field label="Level" value={activePlayer.currentLevel} />
                <Field label="Nationality" value={activePlayer.nationality} />
                <Field label="Joining date" value={new Date(activePlayer.joiningDate).toLocaleDateString()} />
                {activePlayer.previousClub && <Field label="Previous club" value={activePlayer.previousClub} />}
              </dl>

              <div className="mt-5 border-t border-line-soft pt-4">
                <p className="text-xs uppercase tracking-wide text-pitch/50">Emergency contact</p>
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
