import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { subscribeMessages, sendMessage, markConversationRead } from '../../lib/messaging'
import type { ChatMessage } from '../../types'
import Button from '../ui/Button'

interface Props {
  parentUserId: string
  parentName: string
  currentUserId: string
  currentUserRole: 'parent' | 'staff'
  currentUserName: string
}

export default function ChatThread({ parentUserId, parentName, currentUserId, currentUserRole, currentUserName }: Props) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<(ChatMessage & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeMessages(
      parentUserId,
      (items) => {
        setMessages(items)
        setLoading(false)
      },
      () => setLoading(false)
    )
    markConversationRead(parentUserId, currentUserRole).catch(() => {})
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentUserId, currentUserRole])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setSending(true)
    try {
      await sendMessage(parentUserId, parentName, currentUserId, currentUserRole, currentUserName, trimmed)
      setText('')
    } catch {
      // Sending failures are rare (network/permissions) — leave the draft
      // text in place so the person can retry without retyping.
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-card border border-line-soft bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="h-full animate-pulse rounded-card bg-line-soft/20" />
        ) : messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-pitch/50">{t('messaging.emptyThread')}</p>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === currentUserId
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine ? 'bg-grass text-bone' : 'bg-bone-dim/40 text-pitch'
                  }`}
                >
                  {!isMine && <p className="mb-0.5 text-xs font-semibold opacity-70">{m.senderName}</p>}
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line-soft p-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('messaging.inputPlaceholder')}
          className="flex-1 rounded-full border border-line-soft bg-bone px-4 py-2.5 text-sm text-pitch outline-none focus:border-grass"
        />
        <Button type="submit" size="sm" loading={sending} disabled={!text.trim()}>
          {t('messaging.send')}
        </Button>
      </form>
    </div>
  )
}
