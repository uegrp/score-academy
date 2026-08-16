interface Props {
  title: string
  hint?: string
  action?: React.ReactNode
}

export default function EmptyState({ title, hint, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-soft px-6 py-12 text-center">
      <div className="h-10 w-10 rounded-full border border-line-soft" aria-hidden="true" />
      <p className="font-display text-lg tracking-wide text-pitch/80">{title}</p>
      {hint && <p className="max-w-xs text-sm text-line">{hint}</p>}
      {action}
    </div>
  )
}
