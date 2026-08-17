import { useTranslation } from 'react-i18next'
import RoleLoginForm from '../../components/auth/RoleLoginForm'

export default function PlayerLogin() {
  const { t } = useTranslation()
  return (
    <RoleLoginForm
      allowedRoles={['player']}
      redirectTo="/player"
      eyebrow={t('player.loginEyebrow')}
      title={t('player.loginTitle')}
      wrongRoleMessage={t('auth.errors.wrongRolePlayer')}
    />
  )
}
