import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QrScanner from 'qr-scanner'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, where } from '../../lib/collections'
import { decodeCheckInCode } from '../../lib/checkin'
import type { Player, TrainingSession, Team, AttendanceRecord } from '../../types'
import Button from '../ui/Button'
import { Select } from '../ui/FormField'
import EmptyState from '../ui/EmptyState'
import SuccessCheck from '../motion/SuccessCheck'

interface Props {
  players: (Player & { id: string })[]
  /** Shown when there's more than one player to choose from (parent with several children). Hidden for the player's own check-in, which is always exactly one. */
  showPlayerPicker?: boolean
  noPlayerLinkedMessage: string
}

type Phase = 'scanning' | 'confirming' | 'success' | 'error'

export default function CheckInScanner({ players, showPlayerPicker = false, noPlayerLinkedMessage }: Props) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)

  const { data: teams } = useCollection<Team>('teams')

  const [phase, setPhase] = useState<Phase>('scanning')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: sessionMatches } = useCollection<TrainingSession>(
    'trainingSessions',
    sessionId ? [where('__name__', '==', sessionId)] : [],
    [sessionId]
  )

  useEffect(() => {
    if (sessionMatches.length > 0) setSession(sessionMatches[0])
  }, [sessionMatches])

  const { data: existingForPlayer } = useCollection<AttendanceRecord>(
    'attendance',
    sessionId && playerId ? [where('sessionId', '==', sessionId), where('playerId', '==', playerId)] : [],
    [sessionId, playerId]
  )

  useEffect(() => {
    if (!videoRef.current || phase !== 'scanning') return

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        const decoded = decodeCheckInCode(result.data)
        if (!decoded) {
          setErrorMessage(t('parent.checkIn.invalidCode'))
          setPhase('error')
          scanner.stop()
          return
        }
        setSessionId(decoded)
        setPlayerId(players.length > 0 ? players[0].id : '')
        setPhase('confirming')
        scanner.stop()
      },
      { highlightScanRegion: true, highlightCodeOutline: true }
    )
    scannerRef.current = scanner
    scanner.start().catch(() => {
      setErrorMessage(t('parent.checkIn.cameraFailed'))
      setPhase('error')
    })

    return () => {
      scanner.stop()
      scanner.destroy()
      scannerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function restart() {
    setSession(null)
    setSessionId(null)
    setErrorMessage('')
    setPhase('scanning')
  }

  async function confirmCheckIn() {
    if (!sessionId || !playerId) return
    setSubmitting(true)
    try {
      if (existingForPlayer.length > 0) {
        setPhase('success')
        return
      }
      await createDoc('attendance', {
        sessionId,
        playerId,
        status: 'present',
        markedAt: Date.now(),
        checkInTime: Date.now(),
      })
      setPhase('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('parent.checkIn.failed'))
      setPhase('error')
    } finally {
      setSubmitting(false)
    }
  }

  const teamName = (id?: string) => teams.find((tm) => tm.id === id)?.name ?? ''

  if (players.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState title={noPlayerLinkedMessage} />
      </div>
    )
  }

  return (
    <div>
      {phase === 'scanning' && (
        <div className="mt-6 overflow-hidden rounded-card border border-line-soft bg-pitch">
          <video ref={videoRef} className="aspect-square w-full max-w-md object-cover" />
        </div>
      )}

      {phase === 'confirming' && session && (
        <div className="mt-6 max-w-md rounded-card border border-line-soft bg-white p-6">
          <p className="eyebrow text-grass">{t('parent.checkIn.sessionFound')}</p>
          <p className="mt-2 text-lg font-semibold text-pitch">{teamName(session.teamId)}</p>
          <p className="text-sm text-pitch/60">
            {new Date(session.date).toLocaleDateString()} · {session.time} · {session.location}
          </p>

          {showPlayerPicker && players.length > 1 && (
            <div className="mt-4">
              <Select
                label={t('parent.player')}
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                options={players.map((p) => ({ value: p.id, label: p.fullName }))}
              />
            </div>
          )}

          {existingForPlayer.length > 0 && (
            <p className="mt-3 text-sm text-warn">{t('parent.checkIn.alreadyCheckedIn')}</p>
          )}

          <div className="mt-5 flex gap-2">
            <Button variant="secondary" onClick={restart}>
              {t('common.cancel')}
            </Button>
            <Button loading={submitting} onClick={confirmCheckIn}>
              {t('parent.checkIn.confirmButton')}
            </Button>
          </div>
        </div>
      )}

      {phase === 'success' && (
        <div className="mt-6 max-w-md rounded-card border border-grass/30 bg-pitch-soft p-8 text-center">
          <SuccessCheck />
          <p className="mt-5 eyebrow text-grass-bright">{t('parent.checkIn.successEyebrow')}</p>
          <h2 className="mt-2 text-2xl text-bone">{t('parent.checkIn.successTitle')}</h2>
          <Button className="mt-6" onClick={restart}>
            {t('parent.checkIn.scanAnother')}
          </Button>
        </div>
      )}

      {phase === 'error' && (
        <div className="mt-6 max-w-md rounded-card border border-danger/30 bg-white p-6 text-center">
          <p className="text-danger">{errorMessage}</p>
          <Button className="mt-4" onClick={restart}>
            {t('parent.checkIn.tryAgain')}
          </Button>
        </div>
      )}
    </div>
  )
}
