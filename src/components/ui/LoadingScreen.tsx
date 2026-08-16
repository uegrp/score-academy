export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pitch">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-soft border-t-grass-bright" />
        <p className="eyebrow text-bone-dim">Loading SCORE</p>
      </div>
    </div>
  )
}
