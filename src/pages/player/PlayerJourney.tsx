import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { where } from '../../lib/collections'
import type { Player, GalleryItem } from '../../types'
import EmptyState from '../../components/ui/EmptyState'

export default function PlayerJourney() {
  const { t } = useTranslation()
  const { appUser } = useAuth()
  const { data: players } = useCollection<Player>('players', appUser ? [where('playerUserId', '==', appUser.uid)] : [])
  const player = players[0]

  const { data: photos, loading } = useCollection<GalleryItem>(
    'gallery',
    player ? [where('playerIds', 'array-contains', player.id)] : [],
    [player?.id]
  )

  if (!player) {
    return (
      <div>
        <h1 className="text-3xl text-pitch">{t('player.journeyPage.title')}</h1>
        <div className="mt-6">
          <EmptyState title={t('player.notLinkedYet')} hint={t('player.notLinkedYetHint')} />
        </div>
      </div>
    )
  }

  const sorted = [...photos].sort((a, b) => b.uploadedAt - a.uploadedAt)

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('player.journeyPage.title')}</h1>
      <p className="mt-2 text-sm text-pitch/70">{t('player.journeyPage.subtitle')}</p>

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : sorted.length === 0 ? (
          <EmptyState title={t('player.journeyPage.empty')} hint={t('player.journeyPage.emptyHint')} />
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
            {sorted.map((photo) => (
              <img key={photo.id} src={photo.imageUrl} alt="" className="w-full rounded-card object-cover" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
