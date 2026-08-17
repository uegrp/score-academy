import { useTranslation } from 'react-i18next'
import trainingImg from '../../assets/images/kids-training.jpg'

export default function About() {
  const { t } = useTranslation()
  return (
    <div className="pb-28 lg:pb-0">
      <div className="relative flex h-[50vh] items-end overflow-hidden bg-pitch">
        <img src={trainingImg} alt="SCORE players training" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/40 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 md:px-8">
          <p className="eyebrow text-grass-bright">{t('aboutPage.eyebrow')}</p>
          <h1 className="mt-2 text-5xl text-bone">{t('aboutPage.title')}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <p className="text-lg leading-relaxed text-pitch/80">{t('aboutPage.body1')}</p>
        <p className="mt-6 text-lg leading-relaxed text-pitch/80">{t('aboutPage.body2')}</p>
      </div>
    </div>
  )
}
