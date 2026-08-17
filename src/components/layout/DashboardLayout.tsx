import type { ReactNode } from 'react'
import Navbar from './Navbar'
import AppHeader from './AppHeader'
import MobileBottomNav from './MobileBottomNav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bone">
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <AppHeader />
      <main className="flex-1">{children}</main>
      <MobileBottomNav />
    </div>
  )
}
