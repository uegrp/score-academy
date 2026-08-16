import { useEffect, useState, type DependencyList } from 'react'
import type { QueryConstraint, DocumentData } from 'firebase/firestore'
import { subscribeCollection, type CollectionName } from '../lib/collections'
import { firebaseConfigured } from '../lib/firebase'

interface UseCollectionResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  isEmpty: boolean
}

/**
 * Subscribes to a Firestore collection in real time.
 * Returns `data: []` + `isEmpty: true` when there are genuinely no
 * documents — never fabricated placeholder data.
 *
 * `deps` should list any values used to build dynamic `constraints`
 * (e.g. a selected player id, session id, or team id list) so the
 * subscription re-runs when the *filter itself* changes — not just
 * when its shape (where vs orderBy) changes. Without this, switching
 * e.g. which player is selected in a dropdown would keep showing the
 * previous player's data because Firestore QueryConstraint objects
 * don't expose their field/value for comparison.
 */
export function useCollection<T extends DocumentData>(
  name: CollectionName,
  constraints: QueryConstraint[] = [],
  deps: DependencyList = []
): UseCollectionResult<T & { id: string }> {
  const [data, setData] = useState<(T & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false)
      setError('Firebase is not configured yet. Add your project keys to .env.local.')
      return
    }
    setLoading(true)
    const unsub = subscribeCollection<T>(
      name,
      (items) => {
        setData(items)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      constraints
    )
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, constraints.length, ...deps])

  return { data, loading, error, isEmpty: !loading && !error && data.length === 0 }
}
