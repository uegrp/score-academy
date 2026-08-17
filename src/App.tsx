import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoadingScreen from './components/ui/LoadingScreen'

import Home from './pages/public/Home'
import About from './pages/public/About'
import Programs from './pages/public/Programs'
import Teams from './pages/public/Teams'
import Matches from './pages/public/Matches'
import Gallery from './pages/public/Gallery'
import News from './pages/public/News'
import Contact from './pages/public/Contact'
import NotFound from './pages/public/NotFound'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLogin from './pages/auth/AdminLogin'

// The dashboards (parent/coach/admin) plus their Firebase-heavy CRUD
// screens are only needed once someone is signed in, so they're
// code-split out of the public bundle that every first-time visitor
// downloads. This matters a lot on mobile 3G/4G, per the mobile-first
// requirement in the brief.
const ParentLayout = lazy(() => import('./components/layout/ParentLayout'))
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'))
const ParentTraining = lazy(() => import('./pages/parent/ParentTraining'))
const ParentAttendance = lazy(() => import('./pages/parent/ParentAttendance'))
const ParentPerformance = lazy(() => import('./pages/parent/ParentPerformance'))
const ParentProfile = lazy(() => import('./pages/parent/ParentProfile'))
const ParentCheckIn = lazy(() => import('./pages/parent/ParentCheckIn'))
const ParentMessages = lazy(() => import('./pages/parent/ParentMessages'))

const CoachLayout = lazy(() => import('./components/layout/CoachLayout'))
const CoachDashboard = lazy(() => import('./pages/coach/CoachDashboard'))
const CoachPlayers = lazy(() => import('./pages/coach/CoachPlayers'))
const CoachAttendance = lazy(() => import('./pages/coach/CoachAttendance'))
const CoachEvaluations = lazy(() => import('./pages/coach/CoachEvaluations'))
const CoachTasks = lazy(() => import('./pages/coach/CoachTasks'))
const CoachMatchStats = lazy(() => import('./pages/coach/CoachMatchStats'))
const CoachGallery = lazy(() => import('./pages/coach/CoachGallery'))
const CoachMessages = lazy(() => import('./pages/coach/CoachMessages'))

const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminPlayers = lazy(() => import('./pages/admin/AdminPlayers'))
const AdminCoaches = lazy(() => import('./pages/admin/AdminCoaches'))
const AdminTeams = lazy(() => import('./pages/admin/AdminTeams'))
const AdminPrograms = lazy(() => import('./pages/admin/AdminPrograms'))
const AdminTraining = lazy(() => import('./pages/admin/AdminTraining'))
const AdminMatches = lazy(() => import('./pages/admin/AdminMatches'))
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'))
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'))
const AdminRegistrations = lazy(() => import('./pages/admin/AdminRegistrations'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))
const AdminMatchStats = lazy(() => import('./pages/admin/AdminMatchStats'))

const PlayerLayout = lazy(() => import('./components/layout/PlayerLayout'))
const PlayerDashboard = lazy(() => import('./pages/player/PlayerDashboard'))
const PlayerAttendance = lazy(() => import('./pages/player/PlayerAttendance'))
const PlayerPerformance = lazy(() => import('./pages/player/PlayerPerformance'))
const PlayerProfile = lazy(() => import('./pages/player/PlayerProfile'))
const PlayerCheckIn = lazy(() => import('./pages/player/PlayerCheckIn'))
const PlayerTasks = lazy(() => import('./pages/player/PlayerTasks'))
const PlayerJourney = lazy(() => import('./pages/player/PlayerJourney'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/programs" element={<PublicLayout><Programs /></PublicLayout>} />
          <Route path="/teams" element={<PublicLayout><Teams /></PublicLayout>} />
          <Route path="/matches" element={<PublicLayout><Matches /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
          <Route path="/news" element={<PublicLayout><News /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

          {/* Auth — one normal-user entry point (Player/Parent/Coach share
              /login with a role tab), and a completely separate Admin
              portal at /admin/login that never appears in normal nav. */}
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/admin/login" element={<PublicLayout><AdminLogin /></PublicLayout>} />

          {/* Parent portal */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allow={['parent']} loginPath="/login?role=parent">
                <Suspense fallback={<LoadingScreen />}>
                  <DashboardLayout><ParentLayout /></DashboardLayout>
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<ParentDashboard />} />
            <Route path="training" element={<ParentTraining />} />
            <Route path="attendance" element={<ParentAttendance />} />
            <Route path="performance" element={<ParentPerformance />} />
            <Route path="profile" element={<ParentProfile />} />
            <Route path="checkin" element={<ParentCheckIn />} />
            <Route path="messages" element={<ParentMessages />} />
          </Route>

          {/* Coach panel */}
          <Route
            path="/coach"
            element={
              <ProtectedRoute allow={['coach']} loginPath="/login?role=coach">
                <Suspense fallback={<LoadingScreen />}>
                  <DashboardLayout><CoachLayout /></DashboardLayout>
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<CoachDashboard />} />
            <Route path="players" element={<CoachPlayers />} />
            <Route path="attendance" element={<CoachAttendance />} />
            <Route path="evaluations" element={<CoachEvaluations />} />
            <Route path="tasks" element={<CoachTasks />} />
            <Route path="match-stats" element={<CoachMatchStats />} />
            <Route path="gallery" element={<CoachGallery />} />
            <Route path="messages" element={<CoachMessages />} />
          </Route>

          {/* Admin panel */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={['admin', 'super_admin']} loginPath="/admin/login">
                <Suspense fallback={<LoadingScreen />}>
                  <DashboardLayout><AdminLayout /></DashboardLayout>
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="players" element={<AdminPlayers />} />
            <Route path="coaches" element={<AdminCoaches />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="training" element={<AdminTraining />} />
            <Route path="matches" element={<AdminMatches />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="match-stats" element={<AdminMatchStats />} />
          </Route>

          {/* Player portal */}
          <Route
            path="/player"
            element={
              <ProtectedRoute allow={['player']} loginPath="/login?role=player">
                <Suspense fallback={<LoadingScreen />}>
                  <DashboardLayout><PlayerLayout /></DashboardLayout>
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<PlayerDashboard />} />
            <Route path="attendance" element={<PlayerAttendance />} />
            <Route path="performance" element={<PlayerPerformance />} />
            <Route path="profile" element={<PlayerProfile />} />
            <Route path="checkin" element={<PlayerCheckIn />} />
            <Route path="tasks" element={<PlayerTasks />} />
            <Route path="journey" element={<PlayerJourney />} />
          </Route>

          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
