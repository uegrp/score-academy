import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// All values come from environment variables — never hardcode Firebase
// credentials in source. Copy .env.example to .env.local and fill in
// the config from your Firebase project settings.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
// `ignoreUndefinedProperties: true` is the key fix here: every optional
// field across every form in this app (Register, AdminPlayers,
// AdminTeams, AdminPrograms, etc.) uses the `value || undefined` pattern
// for "leave this blank if not applicable". Firestore's default behavior
// is to *reject the entire write* if any field is literally `undefined`
// (as opposed to missing or null) — this one setting makes Firestore
// silently drop those fields instead, which is what every one of those
// forms actually intended. Without this, any optional field left blank
// anywhere in the app throws "Unsupported field value: undefined".
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true })
export const storage = getStorage(app)
export default app
