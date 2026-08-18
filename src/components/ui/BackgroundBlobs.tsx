/**
 * Soft, blurred brand-color gradient blobs positioned absolutely behind
 * content — gives bright/light sections visual personality instead of a
 * flat solid color, without affecting readability (low opacity, blurred,
 * z-index below content).
 */
export default function BackgroundBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -end-24 h-72 w-72 rounded-full bg-grass/20 blur-3xl" />
      <div className="absolute top-1/3 -start-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
      <div className="absolute bottom-0 end-1/4 h-56 w-56 rounded-full bg-grass-bright/10 blur-3xl" />
    </div>
  )
}
