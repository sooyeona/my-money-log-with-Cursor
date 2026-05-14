export function formatKRW(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

export function parseAmountInput(raw: string): number | null {
  const n = Number(String(raw).replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n)
}

/** 달력 셀용 짧은 금액 표기 */
export function formatCompactWon(value: number): string {
  const n = Math.round(value)
  if (n <= 0) return ''
  if (n >= 100_000_000) {
    const eok = n / 100_000_000
    return `${eok % 1 === 0 ? eok : eok.toFixed(1)}억`
  }
  if (n >= 10_000) {
    const man = n / 10_000
    return `${man % 1 === 0 ? man : man.toFixed(1)}만`
  }
  return `${n.toLocaleString('ko-KR')}`
}
