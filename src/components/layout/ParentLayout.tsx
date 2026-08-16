import { Outlet } from 'react-router-dom'
import SectionTabs from '../ui/SectionTabs'

const TABS = [
  { to: '/parent', label: 'Dashboard' },
  { to: '/parent/training', label: 'Training' },
  { to: '/parent/attendance', label: 'Attendance' },
  { to: '/parent/performance', label: 'Performance' },
  { to: '/parent/profile', label: 'Profile' },
]

export default function ParentLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 md:px-8 lg:pb-10">
      <SectionTabs tabs={TABS} />
      <Outlet />
    </div>
  )
}
