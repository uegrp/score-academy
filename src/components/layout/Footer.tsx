import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/images/score-logo.png'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-line-soft bg-pitch pb-24 pt-12 text-bone-dim lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <img src={logo} alt="SCORE" className="h-8 w-auto rounded-md bg-bone px-2 py-1 object-contain" />
            <p className="mt-4 max-w-xs text-sm">{t('footer.tagline')}</p>
          </div>

          <FooterCol
            title={t('footer.academy')}
            links={[
              [t('nav.about'), '/about'],
              [t('nav.programs'), '/programs'],
              [t('nav.teams'), '/teams'],
              [t('nav.news'), '/news'],
            ]}
          />
          <FooterCol
            title={t('footer.getInvolved')}
            links={[
              [t('nav.join'), '/register'],
              [t('nav.matches'), '/matches'],
              [t('nav.gallery'), '/gallery'],
              [t('nav.contact'), '/contact'],
            ]}
          />
          <div>
            <p className="eyebrow text-bone">{t('footer.contact')}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>{t('footer.locationTbd')}</li>
              <li>{t('footer.phoneTbd')}</li>
              <li>{t('footer.emailTbd')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-line-soft pt-6 text-xs text-line">
          © {new Date().getFullYear()} SCORE Football Academy. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow text-bone">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="hover:text-bone">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
