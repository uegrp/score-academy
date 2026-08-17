import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../../components/ui/Button'
import ProgramCard from '../../components/cards/ProgramCard'
import PlayerAttributeCard from '../../components/cards/PlayerAttributeCard'
import logo from '../../assets/images/score-logo.png'
import heroImg from '../../assets/images/team-huddle.jpg'
import trainingImg from '../../assets/images/kids-training.jpg'
import conesImg from '../../assets/images/cones-training.jpg'
import stadiumImg from '../../assets/images/stadium.jpg'
import goalkeeperImg from '../../assets/images/goalkeeper-action.jpg'
import stadiumSunsetImg from '../../assets/images/stadium-sunset.jpg'
import { useCollection } from '../../hooks/useCollection'
import type { Announcement, Program } from '../../types'
import { orderBy, where } from '../../lib/collections'

export default function Home() {
  const { t } = useTranslation()
  const { data: programsData } = useCollection<Program>('programs', [orderBy('order', 'asc')])
  const { data: announcements } = useCollection<Announcement>('announcements', [
    where('published', '==', true),
    orderBy('publishedAt', 'desc'),
  ])

  const WHY_SCORE = [
    { title: t('home.why1Title'), copy: t('home.why1Body') },
    { title: t('home.why2Title'), copy: t('home.why2Body') },
    { title: t('home.why3Title'), copy: t('home.why3Body') },
    { title: t('home.why4Title'), copy: t('home.why4Body') },
    { title: t('home.why5Title'), copy: t('home.why5Body') },
    { title: t('home.why6Title'), copy: t('home.why6Body') },
  ]

  const FALLBACK_PROGRAMS = [
    { id: 'mini-stars', name: t('programsPage.miniStars'), ageRange: 'Ages 5–7', description: t('programsPage.miniStarsDesc') },
    { id: 'junior', name: t('programsPage.junior'), ageRange: 'Ages 8–10', description: t('programsPage.juniorDesc') },
    { id: 'youth', name: t('programsPage.youth'), ageRange: 'Ages 11–13', description: t('programsPage.youthDesc') },
    { id: 'advanced', name: t('programsPage.advanced'), ageRange: 'Ages 14–17', description: t('programsPage.advancedDesc') },
  ]

  const programs = programsData.length > 0 ? programsData : FALLBACK_PROGRAMS

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-pitch">
        <img
          src={heroImg}
          alt="SCORE academy players in a team huddle"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/70 to-pitch/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
          <img src={logo} alt="SCORE" className="h-12 w-auto rounded-lg bg-bone px-3 py-2 object-contain md:h-16" />
          <p className="mt-6 eyebrow text-grass-bright">{t('home.eyebrow')}</p>
          <h1 className="mt-3 max-w-3xl text-5xl text-bone md:text-7xl">
            {t('home.headline1')}
            <br />
            {t('home.headline2')}
          </h1>
          <p className="mt-5 max-w-xl text-base text-bone-dim md:text-lg">{t('home.subtext')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg">{t('home.joinCta')}</Button>
            </Link>
            <Link to="/programs">
              <Button size="lg" variant="ghost">
                {t('home.exploreCta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-bone py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:px-8 md:gap-16">
          <div>
            <p className="eyebrow text-grass">{t('home.aboutEyebrow')}</p>
            <h2 className="mt-3 text-4xl text-pitch">{t('home.aboutTitle')}</h2>
          </div>
          <p className="self-center text-base leading-relaxed text-pitch/80">{t('home.aboutBody')}</p>
        </div>
      </section>

      {/* WHY SCORE */}
      <section className="bg-pitch py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="eyebrow text-grass-bright">{t('home.whyEyebrow')}</p>
          <h2 className="mt-3 max-w-xl text-4xl text-bone">{t('home.whyTitle')}</h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_SCORE.map((item) => (
              <div key={item.title} className="rounded-card border border-line-soft bg-pitch-soft p-6">
                <h3 className="text-xl text-bone">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bone-dim">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="bg-bone py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-grass">{t('home.programsEyebrow')}</p>
              <h2 className="mt-3 text-4xl text-pitch">{t('home.programsTitle')}</h2>
            </div>
            <Link to="/programs" className="eyebrow flex items-center gap-1 text-grass hover:text-grass-bright">
              {t('home.viewAllPrograms')}
              <span aria-hidden="true" className="rtl:-scale-x-100">
                →
              </span>
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((p) => (
              <ProgramCard key={p.id} name={p.name} ageRange={p.ageRange} description={p.description} />
            ))}
          </div>
        </div>
      </section>

      {/* PERFORMANCE SYSTEM (signature element) */}
      <section className="relative overflow-hidden bg-pitch py-20">
        <img src={conesImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:items-center md:px-8">
          <div>
            <p className="eyebrow text-gold-bright">{t('home.performanceEyebrow')}</p>
            <h2 className="mt-3 text-4xl text-bone">{t('home.performanceTitle')}</h2>
            <p className="mt-4 max-w-md text-bone-dim">{t('home.performanceBody')}</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <PlayerAttributeCard
              name="Player Profile"
              subtitle="Sample evaluation"
              variant="gold"
              stats={[
                { code: 'PAS', label: 'Passing', level: 'good' },
                { code: 'DRI', label: 'Dribbling', level: 'very_good' },
                { code: 'CTL', label: 'Ball Control', level: 'good' },
                { code: 'SPD', label: 'Speed', level: 'excellent' },
                { code: 'DEF', label: 'Defending', level: 'developing' },
                { code: 'TMW', label: 'Teamwork', level: 'very_good' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="bg-bone py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-grass">{t('home.galleryEyebrow')}</p>
              <h2 className="mt-3 text-4xl text-pitch">{t('home.galleryTitle')}</h2>
            </div>
            <Link to="/gallery" className="eyebrow flex items-center gap-1 text-grass hover:text-grass-bright">
              {t('home.viewGallery')}
              <span aria-hidden="true" className="rtl:-scale-x-100">
                →
              </span>
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[trainingImg, goalkeeperImg, stadiumSunsetImg, stadiumImg].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className={`h-40 w-full rounded-card object-cover md:h-56 ${i === 0 ? 'col-span-2 row-span-2 h-full' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* NEWS PREVIEW */}
      <section className="bg-pitch py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="eyebrow text-grass-bright">{t('home.newsEyebrow')}</p>
          <h2 className="mt-3 text-4xl text-bone">{t('home.newsTitle')}</h2>

          {announcements.length === 0 ? (
            <p className="mt-8 max-w-md text-bone-dim">{t('home.noNews')}</p>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {announcements.slice(0, 3).map((a) => (
                <article key={a.id} className="rounded-card border border-line-soft bg-pitch-soft p-6">
                  <p className="eyebrow text-grass-bright">{a.category}</p>
                  <h3 className="mt-2 text-xl text-bone">{a.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-bone-dim">{a.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-pitch py-24">
        <img src={stadiumImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/60 to-pitch/40" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center md:px-8">
          <h2 className="text-4xl text-bone md:text-5xl">{t('home.ctaTitle')}</h2>
          <p className="mt-4 text-bone-dim">{t('home.ctaBody')}</p>
          <div className="mt-8 flex justify-center">
            <Link to="/register">
              <Button size="lg">{t('home.joinCta')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
