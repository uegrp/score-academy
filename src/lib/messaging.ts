import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Conversation, ChatMessage } from '../types'

export function conversationRef(parentUserId: string) {
  return doc(db, 'conversations', parentUserId)
}

function messagesCol(parentUserId: string) {
  return collection(db, 'conversations', parentUserId, 'messages')
}

/** Creates the conversation shell on first contact — safe to call every time; no-ops if it already exists. */
export async function ensureConversation(parentUserId: string, parentName: string) {
  const ref = conversationRef(parentUserId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const shell: Omit<Conversation, 'id'> = {
      parentUserId,
      parentName,
      lastMessageText: '',
      lastMessageAt: Date.now(),
      lastSenderRole: null,
      unreadByStaff: false,
      unreadByParent: false,
    }
    await setDoc(ref, shell)
  }
}

/** Staff-side inbox: every parent conversation, most recently active first. */
export function subscribeConversations(
  onData: (items: (Conversation & { id: string })[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'conversations'), orderBy('lastMessageAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Conversation, 'id'>) }))),
    (err) => onError(err as Error)
  )
}

export function subscribeMessages(
  parentUserId: string,
  onData: (items: (ChatMessage & { id: string })[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(messagesCol(parentUserId), orderBy('sentAt', 'asc'))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) }))),
    (err) => onError(err as Error)
  )
}

export async function sendMessage(
  parentUserId: string,
  parentName: string,
  senderId: string,
  senderRole: 'parent' | 'staff',
  senderName: string,
  text: string
) {
  await ensureConversation(parentUserId, parentName)
  const message: Omit<ChatMessage, 'id'> = { senderId, senderRole, senderName, text, sentAt: Date.now() }
  await addDoc(messagesCol(parentUserId), message)
  await updateDoc(conversationRef(parentUserId), {
    lastMessageText: text,
    lastMessageAt: Date.now(),
    lastSenderRole: senderRole,
    unreadByStaff: senderRole === 'parent',
    unreadByParent: senderRole === 'staff',
  })
}

export async function markConversationRead(parentUserId: string, viewerRole: 'parent' | 'staff') {
  await updateDoc(
    conversationRef(parentUserId),
    viewerRole === 'staff' ? { unreadByStaff: false } : { unreadByParent: false }
  )
}
