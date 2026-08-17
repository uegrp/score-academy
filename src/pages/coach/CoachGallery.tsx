import { useAuth } from '../../context/AuthContext'
import GalleryUploader from '../../components/staff/GalleryUploader'

export default function CoachGallery() {
  const { appUser } = useAuth()
  return <GalleryUploader restrictToTeamIds={appUser?.linkedTeamIds ?? []} />
}
