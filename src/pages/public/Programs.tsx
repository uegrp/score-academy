import ProgramCard from '../../components/cards/ProgramCard'
import { useCollection } from '../../hooks/useCollection'
import type { Program } from '../../types'
import { orderBy } from '../../lib/collections'

const FALLBACK = [
  { id: 'mini-stars', name: 'Mini Stars', ageRange: 'Ages 5–7', description: 'First touches on the ball, coordination, and the joy of the game.' },
  { id: 'junior', name: 'Junior Development', ageRange: 'Ages 8–10', description: 'Building technical foundations — control, passing, and small-sided play.' },
  { id: 'youth', name: 'Youth Development', ageRange: 'Ages 11–13', description: 'Tactical understanding, position-specific work, and competitive matches.' },
  { id: 'advanced', name: 'Advanced Academy', ageRange: 'Ages 14–17', description: 'High-performance training for players targeting the next level.' },
]

export default function Programs() {
  const { data, loading } = useCollection<Program>('programs', [orderBy('order', 'asc')])
  const programs = data.length > 0 ? data : FALLBACK

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 pb-28 md:px-8 lg:pb-16">
      <p className="eyebrow text-grass">Training Programs</p>
      <h1 className="mt-2 text-4xl text-pitch md:text-5xl">Programs by age group</h1>
      <p className="mt-3 max-w-xl text-pitch/70">Every program follows a structured curriculum built for that stage of a player's development.</p>

      {loading ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-card bg-line-soft/20" />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <ProgramCard key={p.id} name={p.name} ageRange={p.ageRange} description={p.description} />
          ))}
        </div>
      )}
    </div>
  )
}
