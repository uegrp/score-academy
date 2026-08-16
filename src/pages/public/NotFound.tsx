import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="eyebrow text-grass">404</p>
      <h1 className="text-4xl text-pitch">This page is offside.</h1>
      <p className="text-pitch/60">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}
