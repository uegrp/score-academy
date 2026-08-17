import { useAuth } from '../../context/AuthContext'
import MatchStatsEditor from '../../components/staff/MatchStatsEditor'

export default function CoachMatchStats() {
  const { appUser } = useAuth()
  return <MatchStatsEditor allowedTeamIds={appUser?.linkedTeamIds ?? []} />
}
