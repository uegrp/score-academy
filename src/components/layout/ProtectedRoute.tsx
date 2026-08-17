import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'
import LoadingScreen from '../ui/LoadingScreen'

interface Props {
  children: ReactNode
  allow: UserRole[]
  /** Where to send a signed-out visitor. Defaults to the parent/player login. */
  loginPath?: string
}

/**
 * Frontend route guard. This is a UX convenience only — the real
 * authorization boundary is enforced by Firestore Security Rules
 * (see firestore.rules), since frontend checks can always be bypassed.
 */
export default function ProtectedRoute({ children, allow, loginPath = '/login' }: Props) {
  const { firebaseUser, appUser, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!firebaseUser || !appUser) return <Navigate to={loginPath} replace />
  if (!allow.includes(appUser.role)) return <Navigate to="/" replace />

  return <>{children}</>
}
