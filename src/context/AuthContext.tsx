import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, firebaseConfigured } from '../lib/firebase'
import type { AppUser, UserRole } from '../types'

interface AuthContextValue {
  firebaseUser: User | null
  appUser: AppUser | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid))
        setAppUser(snap.exists() ? (snap.data() as AppUser) : null)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signUp(email: string, password: string, displayName: string, role: UserRole) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    const newUser: Omit<AppUser, 'createdAt'> & { createdAt: unknown } = {
      uid: cred.user.uid,
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', cred.user.uid), newUser)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, configured: firebaseConfigured, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
