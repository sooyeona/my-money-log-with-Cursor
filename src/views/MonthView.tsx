import styled from '@emotion/styled'
import { useMemo } from 'react'
import type { AppTheme } from '../theme'
import { useLedger } from '../context/LedgerContext'
import { BudgetMeter } from '../components/BudgetMeter'
import { formatCompactWon } from '../lib/money'
import { addMonths, daysInMonth, todayISO } from '../lib/dates'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Nav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const NavBtn = styled.button`
  padding: 10px 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  font-weight: 800;
`

const Title = styled.div`
  flex: 1;
  text-align: center;
  font-weight: 900;
  font-size: 16px;
  letter-spacing: -0.02em;
`

const CalendarCard = styled.div`
  border-radius: ${(p) => (p.theme as AppTheme).radius.lg}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  overflow: hidden;
`

const DowRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: ${(p) => (p.theme as AppTheme).colors.elevated};
  border-bottom: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
`

const DowCell = styled.div`
  padding: 8px 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 800;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${(p) => (p.theme as AppTheme).colors.border};
  padding: 1px;
`

const PadCell = styled.div`
  min-height: 64px;
  background: ${(p) => (p.theme as AppTheme).colors.bg};
`

const DayCell = styled.button<{ isToday: boolean }>`
  min-height: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 6px 4px 4px;
  gap: 2px;
  border: none;
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  color: ${(p) => (p.theme as AppTheme).colors.text};
  ${(p) =>
    p.isToday
      ? `box-shadow: inset 0 0 0 2px ${(p.theme as AppTheme).colors.accent};`
      : ''}
`

const DayNum = styled.span<{ muted?: boolean }>`
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  color: ${(p) =>
    p.muted ? (p.theme as AppTheme).colors.muted : (p.theme as AppTheme).colors.text};
`

const DayAmt = styled.span<{ has: boolean }>`
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  word-break: keep-all;
  color: ${(p) =>
    p.has ? (p.theme as AppTheme).colors.accent : (p.theme as AppTheme).colors.muted};
  max-width: 100%;
`

const Legend = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  text-align: center;
  line-height: 1.4;
`

const DOW = ['일', '월', '화', '수', '목', '금', '토'] as const

interface Props {
  monthKey: string
  onChangeMonth: (key: string) => void
  onPickDay: (iso: string) => void
}

type Cell = { type: 'pad' } | { type: 'day'; iso: string; day: number; sum: number }

export function MonthView({ monthKey, onChangeMonth, onPickDay }: Props) {
  const { transactions, settings, sumForMonth } = useLedger()
  const spent = sumForMonth(monthKey)
  const today = todayISO()

  const title = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
  }, [monthKey])

  const cells = useMemo((): Cell[] => {
    const [y, m] = monthKey.split('-').map(Number)
    const dim = daysInMonth(y, m - 1)
    const startWeekday = new Date(y, m - 1, 1).getDay()
    const sums = new Map<number, number>()
    for (let d = 1; d <= dim; d++) {
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const sum = transactions.filter((t) => t.date === iso).reduce((a, t) => a + t.amount, 0)
      sums.set(d, sum)
    }

    const out: Cell[] = []
    for (let i = 0; i < startWeekday; i++) {
      out.push({ type: 'pad' })
    }
    for (let d = 1; d <= dim; d++) {
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      out.push({ type: 'day', iso, day: d, sum: sums.get(d) ?? 0 })
    }
    while (out.length % 7 !== 0) {
      out.push({ type: 'pad' })
    }
    while (out.length < 42) {
      out.push({ type: 'pad' })
    }
    return out
  }, [monthKey, transactions])

  const hasAnySpend = cells.some((c) => c.type === 'day' && c.sum > 0)

  return (
    <Wrap>
      <Nav>
        <NavBtn type="button" onClick={() => onChangeMonth(addMonths(monthKey, -1))}>
          ◀
        </NavBtn>
        <Title>{title}</Title>
        <NavBtn type="button" onClick={() => onChangeMonth(addMonths(monthKey, 1))}>
          ▶
        </NavBtn>
      </Nav>
      <BudgetMeter title="이번 달 지출" spent={spent} limit={settings.monthlyLimit} />
      <CalendarCard>
        <DowRow>
          {DOW.map((d) => (
            <DowCell key={d}>{d}</DowCell>
          ))}
        </DowRow>
        <Grid>
          {cells.map((c, idx) => {
            if (c.type === 'pad') {
              return <PadCell key={`pad-${idx}`} aria-hidden />
            }
            const amt = formatCompactWon(c.sum)
            return (
              <DayCell
                key={c.iso}
                type="button"
                isToday={c.iso === today}
                onClick={() => onPickDay(c.iso)}
              >
                <DayNum>{c.day}</DayNum>
                <DayAmt has={c.sum > 0}>{c.sum > 0 ? `${amt}원` : '·'}</DayAmt>
              </DayCell>
            )
          })}
        </Grid>
      </CalendarCard>
      {!hasAnySpend ? (
        <Legend>이 달 기록이 없습니다. 날짜를 눌러 일별 화면으로 이동할 수 있어요.</Legend>
      ) : (
        <Legend>날짜를 누르면 해당 일의 일별 화면으로 이동합니다.</Legend>
      )}
    </Wrap>
  )
}
