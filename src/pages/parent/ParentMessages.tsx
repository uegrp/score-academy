import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import ChatThread from '../../components/messaging/ChatThread'

export default function ParentMessages() {
  const { t } = useTranslation()
  const { appUser } = useAuth()

  if (!appUser) return null

  return (
    <div>
      <h1 className="text-3xl text-pitch">{t('messaging.title')}</h1>
      <p className="mt-2 text-sm text-pitch/70">{t('messaging.parentSubtitle')}</p>

      <div className="mt-6">
        <ChatThread
          parentUserId={appUser.uid}
          parentName={appUser.displayName}
          currentUserId={appUser.uid}
          currentUserRole="parent"
          currentUserName={appUser.displayName}
        />
      </div>
    </div>
  )
}
