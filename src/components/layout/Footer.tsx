import { Link } from 'react-router-dom'
import logo from '../../assets/images/score-logo.png'

export default function Footer() {
  return (
    <footer className="border-t border-line-soft bg-pitch pb-24 pt-12 text-bone-dim lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <img src={logo} alt="SCORE" className="h-5 w-auto invert" />
            <p className="mt-4 max-w-xs text-sm">
              Professional football training built to develop skill, discipline, and teamwork in every player.
            </p>
          </div>

          <FooterCol
            title="Academy"
            links={[
              ['About', '/about'],
              ['Programs', '/programs'],
              ['Teams', '/teams'],
              ['News', '/news'],
            ]}
          />
          <FooterCol
            title="Get involved"
            links={[
              ['Join SCORE', '/register'],
              ['Matches', '/matches'],
              ['Gallery', '/gallery'],
              ['Contact', '/contact'],
            ]}
          />
          <div>
            <p className="eyebrow text-bone">Contact</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Location — to be added</li>
              <li>Phone — to be added</li>
              <li>Email — to be added</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-line-soft pt-6 text-xs text-line">
          © {new Date().getFullYear()} SCORE Football Academy. All rights reserved.
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
