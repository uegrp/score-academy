import { useTranslation } from 'react-i18next'
import RoleLoginForm from '../../components/auth/RoleLoginForm'

export default function AdminLogin() {
  const { t } = useTranslation()
  return (
    <RoleLoginForm
      allowedRoles={['admin', 'super_admin']}
      redirectTo="/admin"
      eyebrow={t('auth.adminLoginEyebrow')}
      title={t('auth.adminLoginTitle')}
      wrongRoleMessage={t('auth.errors.wrongRoleAdmin')}
    />
  )
}
