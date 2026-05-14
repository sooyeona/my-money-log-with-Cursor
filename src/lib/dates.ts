export function todayISO(): string {
  const d = new Date()
  return toISODate(d)
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function monthKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function yearFromDate(d: Date): number {
  return d.getFullYear()
}

export function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate()
}

export function addMonths(isoMonth: string, delta: number): string {
  const [y, m] = isoMonth.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return monthKeyFromDate(d)
}

export function addYears(year: number, delta: number): number {
  return year + delta
}
