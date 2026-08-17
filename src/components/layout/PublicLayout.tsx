import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import RouteTransition from './RouteTransition'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bone">
      <Navbar />
      <main className="flex-1">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
