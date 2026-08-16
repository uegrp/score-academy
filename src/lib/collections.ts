import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'

// Central place naming every Firestore collection used by SCORE.
// Keeping names here avoids typo drift across the app.
export const COLLECTIONS = {
  users: 'users',
  players: 'players',
  coaches: 'coaches',
  teams: 'teams',
  programs: 'programs',
  trainingSessions: 'trainingSessions',
  attendance: 'attendance',
  performanceEvaluations: 'performanceEvaluations',
  matches: 'matches',
  announcements: 'announcements',
  gallery: 'gallery',
  registrations: 'registrations',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]

export function colRef(name: CollectionName) {
  return collection(db, name)
}

export function docRef(name: CollectionName, id: string) {
  return doc(db, name, id)
}

/** Subscribe to a collection in real time, with optional query constraints. */
export function subscribeCollection<T extends DocumentData>(
  name: CollectionName,
  onData: (items: (T & { id: string })[]) => void,
  onError: (err: Error) => void,
  constraints: QueryConstraint[] = []
) {
  const q = query(colRef(name), ...constraints)
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))
      onData(items)
    },
    (err) => onError(err as Error)
  )
}

export async function createDoc<T extends DocumentData>(name: CollectionName, data: T) {
  return addDoc(colRef(name), data)
}

export async function updateDocById(name: CollectionName, id: string, data: Partial<DocumentData>) {
  return updateDoc(docRef(name, id), data)
}

export async function deleteDocById(name: CollectionName, id: string) {
  return deleteDoc(docRef(name, id))
}

export { where, orderBy }
