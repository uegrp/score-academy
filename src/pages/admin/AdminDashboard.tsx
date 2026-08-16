import { useCollection } from '../../hooks/useCollection'
import EmptyState from '../../components/ui/EmptyState'
import type { Player, Coach, Team, Match, Registration } from '../../types'
import { where } from '../../lib/collections'

export default function AdminDashboard() {
  const { data: players } = useCollection<Player>('players')
  const { data: coaches } = useCollection<Coach>('coaches')
  const { data: teams } = useCollection<Team>('teams')
  const { data: matches } = useCollection<Match>('matches')
  const { data: pending } = useCollection<Registration>('registrations', [where('status', '==', 'pending')])

  const activePlayers = players.filter((p) => p.status === 'active')

  return (
    <div>
      <p className="eyebrow text-grass">Admin</p>
      <h1 className="mt-2 text-4xl text-pitch">Academy overview</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total players" value={players.length} />
        <StatCard label="Active players" value={activePlayers.length} />
        <StatCard label="Coaches" value={coaches.length} />
        <StatCard label="Teams" value={teams.length} />
        <StatCard label="Upcoming matches" value={matches.filter((m) => m.date > Date.now()).length} />
        <StatCard label="Pending registrations" value={pending.length} highlight={pending.length > 0} />
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">Pending registrations</h2>
        {pending.length === 0 ? (
          <EmptyState title="No pending registrations" hint="New player applications will appear here for review." />
        ) : (
          <div className="mt-4 divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-pitch">{r.player.fullName}</p>
                  <p className="text-sm text-pitch/60">
                    {r.parentName} · {r.parentEmail}
                  </p>
                </div>
                <span className="rounded-full bg-warn/10 px-3 py-1 text-xs font-medium text-warn">Pending</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-card border p-5 ${highlight ? 'border-warn/50 bg-warn/5' : 'border-line-soft bg-white'}`}>
      <p className="stat-figure text-3xl text-pitch">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-pitch/60">{label}</p>
    </div>
  )
}
