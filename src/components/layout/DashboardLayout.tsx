import type { ReactNode } from 'react'
import Navbar from './Navbar'
import MobileBottomNav from './MobileBottomNav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bone">
      <Navbar />
      <main className="flex-1">{children}</main>
      <MobileBottomNav />
    </div>
  )
}
