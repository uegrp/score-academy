import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useTranslation } from 'react-i18next'
import Modal from '../ui/Modal'
import { encodeCheckInCode } from '../../lib/checkin'

interface Props {
  open: boolean
  onClose: () => void
  sessionId: string
  sessionLabel: string
}

/**
 * Shows a QR code encoding this training session's check-in code.
 * Players/parents scan it from the Parent app's "Scan to check in"
 * screen to mark themselves present — see pages/parent/ParentCheckIn.tsx
 * and lib/checkin.ts for the shared encode/decode format.
 */
export default function CheckInQrModal({ open, onClose, sessionId, sessionLabel }: Props) {
  const { t } = useTranslation()
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !sessionId) return
    let cancelled = false
    setDataUrl(null)
    setError(null)
    QRCode.toDataURL(encodeCheckInCode(sessionId), { width: 320, margin: 2 })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setError(t('coach.qrGenerateFailed'))
      })
    return () => {
      cancelled = true
    }
  }, [open, sessionId, t])

  return (
    <Modal open={open} onClose={onClose} title={t('coach.checkInQrTitle')}>
      <p className="text-sm text-pitch/60">{sessionLabel}</p>
      <div className="mt-4 flex flex-col items-center gap-3">
        {error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : dataUrl ? (
          <img src={dataUrl} alt={t('coach.checkInQrTitle')} className="h-64 w-64 rounded-card border border-line-soft" />
        ) : (
          <div className="h-64 w-64 animate-pulse rounded-card bg-line-soft/30" />
        )}
        <p className="max-w-xs text-center text-sm text-pitch/60">{t('coach.qrInstructions')}</p>
      </div>
    </Modal>
  )
}
