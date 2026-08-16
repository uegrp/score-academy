import { Outlet } from 'react-router-dom'
import SectionTabs from '../ui/SectionTabs'

const TABS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/players', label: 'Players' },
  { to: '/admin/coaches', label: 'Coaches' },
  { to: '/admin/teams', label: 'Teams' },
  { to: '/admin/programs', label: 'Programs' },
  { to: '/admin/training', label: 'Training' },
  { to: '/admin/matches', label: 'Matches' },
  { to: '/admin/announcements', label: 'News' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/registrations', label: 'Registrations' },
]

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 md:px-8 lg:pb-10">
      <SectionTabs tabs={TABS} />
      <Outlet />
    </div>
  )
}
