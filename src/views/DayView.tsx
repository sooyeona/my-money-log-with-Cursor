import styled from '@emotion/styled'
import { useMemo, useState } from 'react'
import type { AppTheme } from '../theme'
import type { Transaction } from '../types'
import { useLedger } from '../context/LedgerContext'
import { BudgetMeter } from '../components/BudgetMeter'
import { SortableDayList } from '../components/SortableDayList'
import { formatKRW } from '../lib/money'
import { parseAmountInput } from '../lib/money'
import { parseISODate, toISODate } from '../lib/dates'

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
  flex: 0 0 auto;
  padding: 10px 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  color: ${(p) => (p.theme as AppTheme).colors.text};
  font-weight: 700;
`

const DateLabel = styled.label`
  flex: 1;
  text-align: center;
  padding: 10px 8px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.elevated};
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.02em;
  cursor: pointer;
`

const HiddenDate = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

const Summary = styled.div`
  font-size: 13px;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  text-align: center;
`

const Card = styled.div`
  padding: 14px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.lg}px;
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  margin-bottom: 10px;
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  margin-bottom: 10px;
`

const Input = styled.input`
  padding: 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.elevated};
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button<{ on: boolean }>`
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid
    ${(p) =>
      p.on ? (p.theme as AppTheme).colors.accent : (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.on ? (p.theme as AppTheme).colors.accentSoft : (p.theme as AppTheme).colors.elevated)};
  color: ${(p) => (p.theme as AppTheme).colors.text};
  font-size: 13px;
  font-weight: 700;
`

const Primary = styled.button`
  width: 100%;
  margin-top: 4px;
  padding: 14px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: none;
  background: ${(p) => (p.theme as AppTheme).colors.accent};
  color: #fff;
  font-weight: 800;
  font-size: 15px;
`

const Ghost = styled.button`
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: transparent;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  font-weight: 700;
`

const BlockHint = styled.p`
  margin: 0;
  padding: 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  background: ${(p) => (p.theme as AppTheme).colors.accentSoft};
  color: ${(p) => (p.theme as AppTheme).colors.text};
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  text-align: center;
`

const EmptyDay = styled.p`
  margin: 24px 0;
  text-align: center;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  font-size: 14px;
`

const UserBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const UserTitle = styled.div`
  font-size: 13px;
  font-weight: 900;
  color: ${(p) => (p.theme as AppTheme).colors.accent};
  padding: 4px 2px 0;
`

const CATEGORIES = ['식비', '교통', '문화/여가', '생활', '의료', '기타'] as const

interface Props {
  date: string
  onChangeDate: (iso: string) => void
}

export function DayView({ date, onChangeDate }: Props) {
  const {
    activeUserScope,
    setActiveUserScope,
    addTransaction,
    updateTransaction,
    settings,
    transactionsForDateSorted,
    sumForDate,
    sumForMonth,
    allTransactions,
    getUserName,
    users,
  } = useLedger()
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [memo, setMemo] = useState('')
  const [editing, setEditing] = useState<Transaction | null>(null)

  const isAll = activeUserScope === 'all'
  const monthKey = date.slice(0, 7)
  const items = transactionsForDateSorted(date)
  const daySum = sumForDate(date)
  const monthSum = sumForMonth(monthKey)

  const groupedByUser = useMemo(() => {
    const txs = allTransactions
      .filter((t) => t.date === date)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.userId.localeCompare(b.userId))
    const m = new Map<string, Transaction[]>()
    for (const t of txs) {
      const arr = m.get(t.userId) ?? []
      arr.push(t)
      m.set(t.userId, arr)
    }
    return [...m.entries()]
  }, [allTransactions, date])

  const shiftDay = (delta: number) => {
    const d = parseISODate(date)
    d.setDate(d.getDate() + delta)
    onChangeDate(toISODate(d))
  }

  const label = useMemo(() => {
    const d = parseISODate(date)
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  }, [date])

  const resetForm = () => {
    setAmountStr('')
    setMemo('')
    setCategory(CATEGORIES[0])
    setEditing(null)
  }

  const openEdit = (t: Transaction) => {
    if (activeUserScope === 'all') {
      void setActiveUserScope(t.userId).catch((e: unknown) =>
        window.alert(e instanceof Error ? e.message : '전환에 실패했습니다.'),
      )
    }
    setEditing(t)
    setAmountStr(String(t.amount))
    setCategory(t.category)
    setMemo(t.memo)
  }

  const submit = async () => {
    const amount = parseAmountInput(amountStr)
    if (!amount) return
    try {
      if (editing) {
        await updateTransaction(editing.id, { date, amount, category, memo: memo.trim() })
      } else {
        await addTransaction({ date, amount, category, memo: memo.trim() })
      }
      resetForm()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '저장에 실패했습니다.')
    }
  }

  const budgetTitle = isAll ? '이번 달 지출(전체 합계)' : '이번 달 지출'

  return (
    <Wrap>
      <Nav>
        <NavBtn type="button" onClick={() => shiftDay(-1)}>
          ◀
        </NavBtn>
        <DateLabel htmlFor="ledger-date">{label}</DateLabel>
        <NavBtn type="button" onClick={() => shiftDay(1)}>
          ▶
        </NavBtn>
      </Nav>
      <HiddenDate
        id="ledger-date"
        type="date"
        value={date}
        onChange={(e) => e.target.value && onChangeDate(e.target.value)}
      />
      <Summary>
        이 날 합계 <strong>{formatKRW(daySum)}</strong> · 이번 달 누적{' '}
        <strong>{formatKRW(monthSum)}</strong>
      </Summary>
      <BudgetMeter title={budgetTitle} spent={monthSum} limit={settings.monthlyLimit} />
      {isAll ? (
        <BlockHint>전체 보기에서는 지출을 추가할 수 없습니다. 상단에서 사용자를 선택하세요.</BlockHint>
      ) : users.length === 0 ? (
        <BlockHint>먼저 상단에서 사용자를 추가해 주세요.</BlockHint>
      ) : (
        <Card>
          <Field htmlFor="ledger-amt">
            금액
            <Input
              id="ledger-amt"
              inputMode="numeric"
              placeholder="예: 12000"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
            />
          </Field>
          <Section>
            분류
            <Chips>
              {CATEGORIES.map((c) => (
                <Chip key={c} type="button" on={category === c} onClick={() => setCategory(c)}>
                  {c}
                </Chip>
              ))}
            </Chips>
          </Section>
          <Field htmlFor="ledger-memo">
            메모
            <Input id="ledger-memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="선택" />
          </Field>
          <Primary type="button" onClick={submit}>
            {editing ? '수정 저장' : '지출 추가'}
          </Primary>
          {editing ? (
            <Ghost type="button" onClick={resetForm}>
              취소
            </Ghost>
          ) : null}
        </Card>
      )}
      {isAll ? (
        groupedByUser.length === 0 ? (
          <EmptyDay>이 날짜에는 내역이 없습니다.</EmptyDay>
        ) : (
          <UserBlock>
            {groupedByUser.map(([uid, txs]) => (
              <div key={uid}>
                <UserTitle>{getUserName(uid)}</UserTitle>
                <SortableDayList date={date} items={txs} onEdit={openEdit} readOnly />
              </div>
            ))}
          </UserBlock>
        )
      ) : (
        <SortableDayList date={date} items={items} onEdit={openEdit} readOnly={false} />
      )}
    </Wrap>
  )
}
