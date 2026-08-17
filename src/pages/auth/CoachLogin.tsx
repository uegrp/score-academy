import { useTranslation } from 'react-i18next'
import RoleLoginForm from '../../components/auth/RoleLoginForm'

export default function CoachLogin() {
  const { t } = useTranslation()
  return (
    <RoleLoginForm
      allowedRoles={['coach']}
      redirectTo="/coach"
      eyebrow={t('auth.coachLoginEyebrow')}
      title={t('auth.coachLoginTitle')}
      wrongRoleMessage={t('auth.errors.wrongRoleCoach')}
    />
  )
}
