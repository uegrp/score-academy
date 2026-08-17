/** Returns the timestamp for local midnight of the given date (defaults to today). */
export function dayStart(date: Date | number = Date.now()): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function isSameDay(a: number, b: number): boolean {
  return dayStart(a) === dayStart(b)
}
