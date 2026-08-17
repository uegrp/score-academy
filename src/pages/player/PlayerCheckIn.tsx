import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { where } from '../../lib/collections'
import type { Player } from '../../types'
import CheckInScanner from '../../components/checkin/CheckInScanner'

export default function PlayerCheckIn() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const { data: players } = useCollection<Player>('players', appUser ? [where('playerUserId', '==', appUser.uid)] : [])

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('parent.checkIn.title')}</h1>
      <p className="mt-2 text-sm text-pitch/70">{t('parent.checkIn.subtitle')}</p>
      <CheckInScanner players={players} noPlayerLinkedMessage={t('player.notLinkedYet')} />
    </div>
  )
}
