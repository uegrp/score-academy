// Shared format for SCORE's training-session check-in QR codes.
// Keeping the encode/decode logic in one place means the coach's QR
// generator and the parent's scanner can never drift out of sync.
const PREFIX = 'SCORE_CHECKIN:'

export function encodeCheckInCode(sessionId: string): string {
  return `${PREFIX}${sessionId}`
}

/** Returns the sessionId if `raw` is a valid SCORE check-in code, otherwise null. */
export function decodeCheckInCode(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed.startsWith(PREFIX)) return null
  const sessionId = trimmed.slice(PREFIX.length).trim()
  return sessionId.length > 0 ? sessionId : null
}
