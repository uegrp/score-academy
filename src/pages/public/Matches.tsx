import { useCollection } from '../../hooks/useCollection'
import EmptyState from '../../components/ui/EmptyState'
import type { Match } from '../../types'
import { orderBy } from '../../lib/collections'

export default function Matches() {
  const { data: matches, loading } = useCollection<Match>('matches', [orderBy('date', 'asc')])
  const now = Date.now()
  const upcoming = matches.filter((m) => m.date >= now)
  const previous = matches.filter((m) => m.date < now).reverse()

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 pb-28 md:px-8 lg:pb-16">
      <p className="eyebrow text-grass">Fixtures</p>
      <h1 className="mt-2 text-4xl text-pitch md:text-5xl">Matches</h1>

      {loading ? (
        <div className="mt-10 h-32 animate-pulse rounded-card bg-line-soft/20" />
      ) : (
        <>
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">Upcoming</h2>
            {upcoming.length === 0 ? (
              <EmptyState title="No matches scheduled" />
            ) : (
              <ul className="mt-4 space-y-3">
                {upcoming.map((m) => <MatchRow key={m.id} match={m} />)}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-pitch/60">Results</h2>
            {previous.length === 0 ? (
              <EmptyState title="No previous matches yet" />
            ) : (
              <ul className="mt-4 space-y-3">
                {previous.map((m) => <MatchRow key={m.id} match={m} />)}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function MatchRow({ match }: { match: Match }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line-soft bg-white p-4">
      <div>
        <p className="font-medium text-pitch">
          SCORE {match.isHome ? 'vs' : '@'} {match.opponent}
        </p>
        <p className="text-sm text-pitch/60">
          {new Date(match.date).toLocaleDateString()} · {match.kickoffTime} · {match.location}
        </p>
      </div>
      {match.result && (
        <span className="stat-figure rounded-full bg-grass/10 px-3 py-1 text-sm font-semibold text-grass">
          {match.result.scoreFor} – {match.result.scoreAgainst}
        </span>
      )}
    </li>
  )
}
