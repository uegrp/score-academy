import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { subscribeConversations } from '../../lib/messaging'
import type { Conversation } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import ChatThread from '../../components/messaging/ChatThread'

export default function StaffMessagesInbox() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const [conversations, setConversations] = useState<(Conversation & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<(Conversation & { id: string }) | null>(null)

  useEffect(() => {
    const unsub = subscribeConversations(
      (items) => {
        setConversations(items)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [])

  if (!appUser) return null

  if (selected) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Button size="sm" variant="ghost" className="!text-pitch !border-line-soft" onClick={() => setSelected(null)}>
              ← {t('messaging.backToInbox')}
            </Button>
            <h1 className="mt-2 text-2xl text-pitch">{selected.parentName}</h1>
          </div>
        </div>
        <ChatThread
          parentUserId={selected.parentUserId}
          parentName={selected.parentName}
          currentUserId={appUser.uid}
          currentUserRole="staff"
          currentUserName={appUser.displayName}
        />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('messaging.title')}</h1>

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : conversations.length === 0 ? (
          <EmptyState title={t('messaging.noConversations')} hint={t('messaging.noConversationsHint')} />
        ) : (
          <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="flex w-full items-center justify-between gap-3 p-4 text-start transition-colors hover:bg-bone-dim/20"
              >
                <div className="min-w-0">
                  <p className="font-medium text-pitch">{c.parentName}</p>
                  <p className="truncate text-sm text-pitch/60">{c.lastMessageText || t('messaging.noMessagesYet')}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {c.unreadByStaff && <span className="h-2.5 w-2.5 rounded-full bg-grass" aria-hidden="true" />}
                  {c.lastMessageAt > 0 && (
                    <span className="text-xs text-pitch/40">{new Date(c.lastMessageAt).toLocaleDateString()}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
