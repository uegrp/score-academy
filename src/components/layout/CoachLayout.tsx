import { Outlet } from 'react-router-dom'
import SectionTabs from '../ui/SectionTabs'

const TABS = [
  { to: '/coach', label: 'Dashboard' },
  { to: '/coach/players', label: 'Players' },
  { to: '/coach/attendance', label: 'Attendance' },
  { to: '/coach/evaluations', label: 'Evaluate' },
]

export default function CoachLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 md:px-8 lg:pb-10">
      <SectionTabs tabs={TABS} />
      <Outlet />
    </div>
  )
}
