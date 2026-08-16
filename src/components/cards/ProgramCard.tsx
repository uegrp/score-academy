interface Props {
  name: string
  ageRange: string
  description: string
  featured?: boolean
}

export default function ProgramCard({ name, ageRange, description, featured }: Props) {
  return (
    <div
      className={`flex flex-col justify-between rounded-card border p-6 transition-colors ${
        featured ? 'border-gold/50 bg-pitch-soft' : 'border-line-soft bg-pitch-soft/60'
      }`}
    >
      <div>
        <p className={`eyebrow ${featured ? 'text-gold-bright' : 'text-grass-bright'}`}>{ageRange}</p>
        <h3 className="mt-2 text-2xl text-bone">{name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-bone-dim">{description}</p>
      </div>
    </div>
  )
}
