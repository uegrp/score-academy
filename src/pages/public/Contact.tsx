import { useTranslation } from 'react-i18next'

export default function Contact() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 pb-28 md:px-8 lg:pb-16">
      <p className="eyebrow text-grass">{t('contactPage.eyebrow')}</p>
      <h1 className="mt-2 text-4xl text-pitch md:text-5xl">{t('contactPage.title')}</h1>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <InfoCard label={t('contactPage.location')} value={t('contactPage.locationValue')} />
        <InfoCard label={t('contactPage.phone')} value={t('contactPage.phoneValue')} />
        <InfoCard label={t('contactPage.whatsapp')} value={t('contactPage.whatsappValue')} />
        <InfoCard label={t('contactPage.email')} value={t('contactPage.emailValue')} />
      </div>

      <div className="mt-10 flex h-64 items-center justify-center rounded-card border border-dashed border-line-soft text-sm text-pitch/50">
        {t('contactPage.mapPlaceholder')}
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line-soft bg-white p-5">
      <p className="eyebrow text-grass">{label}</p>
      <p className="mt-2 text-pitch/70">{value}</p>
    </div>
  )
}
