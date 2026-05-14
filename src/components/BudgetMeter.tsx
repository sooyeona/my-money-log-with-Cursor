import styled from '@emotion/styled'
import type { AppTheme } from '../theme'
import { formatKRW } from '../lib/money'

const Wrap = styled.div`
  padding: 12px 14px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  box-shadow: ${(p) => (p.theme as AppTheme).shadow};
`

const Row = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
`

const Label = styled.span`
  font-size: 13px;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
`

const Value = styled.span`
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.02em;
`

const Track = styled.div`
  height: 8px;
  border-radius: 999px;
  background: ${(p) => (p.theme as AppTheme).colors.elevated};
  overflow: hidden;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
`

const Fill = styled.div<{ pct: number; tone: 'ok' | 'warn' | 'danger' }>`
  height: 100%;
  width: ${(p) => `${Math.min(100, p.pct)}%`};
  border-radius: 999px;
  background: ${(p) => {
    const t = p.theme as AppTheme
    if (p.tone === 'danger') return t.colors.danger
    if (p.tone === 'warn') return t.colors.warn
    return t.colors.ok
  }};
  transition: width 0.25s ease, background 0.2s ease;
`

const Hint = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  line-height: 1.4;
`

interface Props {
  title: string
  spent: number
  limit: number | null
  hint?: string
}

export function BudgetMeter({ title, spent, limit, hint }: Props) {
  const hasLimit = limit !== null && limit > 0
  const pct = hasLimit ? (spent / limit!) * 100 : 0
  const tone: 'ok' | 'warn' | 'danger' = !hasLimit
    ? 'ok'
    : pct >= 100
      ? 'danger'
      : pct >= 85
        ? 'warn'
        : 'ok'

  return (
    <Wrap>
      <Row>
        <Label>{title}</Label>
        <Value>{formatKRW(spent)}</Value>
      </Row>
      {hasLimit ? (
        <>
          <Track>
            <Fill pct={pct} tone={tone} />
          </Track>
          <Hint>
            한도 {formatKRW(limit!)} · {pct >= 100 ? '한도 초과' : `사용률 ${Math.round(pct)}%`}
          </Hint>
        </>
      ) : (
        <Hint>설정에서 한도를 지정하면 진행률이 표시됩니다.</Hint>
      )}
      {hint && hasLimit ? <Hint>{hint}</Hint> : null}
    </Wrap>
  )
}
