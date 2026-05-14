import styled from '@emotion/styled'
import { useMemo } from 'react'
import type { AppTheme } from '../theme'
import { useLedger } from '../context/LedgerContext'
import { BudgetMeter } from '../components/BudgetMeter'
import { formatKRW } from '../lib/money'
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
  font-size: 18px;
  letter-spacing: -0.02em;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`

const Cell = styled.button`
  text-align: left;
  padding: 14px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.surface};
`

const M = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  margin-bottom: 6px;
`

const A = styled.div`
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.03em;
`

interface Props {
  year: number
  onChangeYear: (y: number) => void
  onPickMonth: (monthKey: string) => void
}

export function YearView({ year, onChangeYear, onPickMonth }: Props) {
  const { settings, sumForMonth } = useLedger()
  const ySum = useMemo(() => {
    let s = 0
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, '0')}`
      s += sumForMonth(key)
    }
    return s
  }, [year, sumForMonth])

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1
      const key = `${year}-${String(m).padStart(2, '0')}`
      const label = new Date(year, i, 1).toLocaleDateString('ko-KR', { month: 'long' })
      const sum = sumForMonth(key)
      return { key, label, sum }
    })
  }, [year, sumForMonth])

  return (
    <Wrap>
      <Nav>
        <NavBtn type="button" onClick={() => onChangeYear(year - 1)}>
          ◀
        </NavBtn>
        <Title>{year}년</Title>
        <NavBtn type="button" onClick={() => onChangeYear(year + 1)}>
          ▶
        </NavBtn>
      </Nav>
      <BudgetMeter title="올해 지출" spent={ySum} limit={settings.yearlyLimit} />
      <Grid>
        {months.map((x) => (
          <Cell key={x.key} type="button" onClick={() => onPickMonth(x.key)}>
            <M>{x.label}</M>
            <A>{formatKRW(x.sum)}</A>
          </Cell>
        ))}
      </Grid>
    </Wrap>
  )
}
