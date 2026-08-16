import trainingImg from '../../assets/images/kids-training.jpg'

export default function About() {
  return (
    <div className="pb-28 lg:pb-0">
      <div className="relative flex h-[50vh] items-end overflow-hidden bg-pitch">
        <img src={trainingImg} alt="SCORE players training" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/40 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 md:px-8">
          <p className="eyebrow text-grass-bright">About SCORE</p>
          <h1 className="mt-2 text-5xl text-bone">Our philosophy</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <p className="text-lg leading-relaxed text-pitch/80">
          SCORE is dedicated to developing young football players through structured training, professional
          coaching, teamwork, discipline, and continuous performance development. We believe every player deserves a
          clear development path, tracked honestly, and coaches who know them by name.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-pitch/80">
          Our programs are built around age-appropriate technical, physical, and mental development — not results at
          the expense of growth. Progress is measured, logged, and shared with parents after every evaluation.
        </p>
      </div>
    </div>
  )
}
