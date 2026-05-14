import styled from '@emotion/styled'
import { useMemo } from 'react'
import type { AppTheme } from '../theme'
import { useLedger } from '../context/LedgerContext'
import { formatKRW } from '../lib/money'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Card = styled.div`
  padding: 16px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.lg}px;
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
`

const H = styled.h2`
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.02em;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`

const Th = styled.th`
  text-align: left;
  padding: 8px 6px;
  border-bottom: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  font-weight: 800;
  font-size: 12px;
`

const Td = styled.td`
  padding: 10px 6px;
  border-bottom: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  font-weight: 700;
`

const TdNum = styled(Td)`
  text-align: right;
  font-weight: 900;
  letter-spacing: -0.02em;
`

const TotalRow = styled.tr`
  background: ${(p) => (p.theme as AppTheme).colors.accentSoft};
  font-weight: 900;
`

const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  line-height: 1.45;
`

interface Props {
  anchor: string
}

export function SummaryView({ anchor }: Props) {
  const { users, sumForMonthByUser, sumForYearByUser, allTransactions } = useLedger()
  const monthKey = anchor.slice(0, 7)
  const year = Number(anchor.slice(0, 4))

  const monthTitle = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
  }, [monthKey])

  const rows = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        name: u.name,
        month: sumForMonthByUser(u.id, monthKey),
        year: sumForYearByUser(u.id, year),
      })),
    [users, monthKey, year, sumForMonthByUser, sumForYearByUser],
  )

  const monthGrand = rows.reduce((a, r) => a + r.month, 0)
  const yearGrand = rows.reduce((a, r) => a + r.year, 0)

  const categoryMonth = useMemo(() => {
    const m = new Map<string, number>()
    for (const t of allTransactions) {
      if (!t.date.startsWith(monthKey)) continue
      m.set(t.category, (m.get(t.category) ?? 0) + t.amount)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [allTransactions, monthKey])

  if (users.length === 0) {
    return (
      <Wrap>
        <Card>
          <H>통합</H>
          <Hint>사용자가 없습니다. 상단에서 사용자를 추가한 뒤 지출을 입력하면 이 화면에 집계됩니다.</Hint>
        </Card>
      </Wrap>
    )
  }

  return (
    <Wrap>
      <Card>
        <H>사용자별 집계 · {monthTitle}</H>
        <Table>
          <thead>
            <tr>
              <Th>사용자</Th>
              <Th style={{ textAlign: 'right' }}>이번 달</Th>
              <Th style={{ textAlign: 'right' }}>{year}년</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <Td>{r.name}</Td>
                <TdNum>{formatKRW(r.month)}</TdNum>
                <TdNum>{formatKRW(r.year)}</TdNum>
              </tr>
            ))}
            <TotalRow>
              <Td>합계</Td>
              <TdNum>{formatKRW(monthGrand)}</TdNum>
              <TdNum>{formatKRW(yearGrand)}</TdNum>
            </TotalRow>
          </tbody>
        </Table>
        <Hint style={{ marginTop: 12 }}>
          일·월·연 탭은 상단에서 선택한 범위(전체 또는 특정 사용자)에 맞춰 보입니다. 이 화면은 항상 전체
          데이터를 기준으로 합니다.
        </Hint>
      </Card>
      <Card>
        <H>이번 달 분류별(전체)</H>
        {categoryMonth.length === 0 ? (
          <Hint>이번 달 기록이 없습니다.</Hint>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>분류</Th>
                <Th style={{ textAlign: 'right' }}>금액</Th>
              </tr>
            </thead>
            <tbody>
              {categoryMonth.map(([cat, amt]) => (
                <tr key={cat}>
                  <Td>{cat}</Td>
                  <TdNum>{formatKRW(amt)}</TdNum>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Wrap>
  )
}
