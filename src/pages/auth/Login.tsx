import { useTranslation } from 'react-i18next'
import RoleLoginForm from '../../components/auth/RoleLoginForm'

export default function Login() {
  const { t } = useTranslation()
  return (
    <RoleLoginForm
      allowedRoles={['parent']}
      redirectTo="/parent"
      eyebrow={t('auth.loginEyebrow')}
      title={t('auth.loginTitle')}
      wrongRoleMessage={t('auth.errors.wrongRoleParent')}
      showJoinLink
    />
  )
}
