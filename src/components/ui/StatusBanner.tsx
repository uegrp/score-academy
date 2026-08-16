export default function StatusBanner({ status }: { status: { type: 'success' | 'error'; message: string } | null }) {
  if (!status) return null
  return (
    <div
      className={`mb-4 rounded-xl px-4 py-3 text-sm ${
        status.type === 'success' ? 'bg-grass/10 text-grass' : 'bg-danger/10 text-danger'
      }`}
      role="status"
    >
      {status.message}
    </div>
  )
}
