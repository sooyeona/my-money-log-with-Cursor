import styled from '@emotion/styled'
import { useState } from 'react'
import type { AppTheme } from '../theme'
import { useLedger } from '../context/LedgerContext'
import { parseAmountInput } from '../lib/money'

const Card = styled.div`
  padding: 16px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.lg}px;
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  margin-bottom: 12px;
`

const H = styled.h2`
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.02em;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 700;
`

const UserRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  font-size: 14px;
  font-weight: 700;
`

const Hint = styled.p`
  margin: 0 0 12px;
  font-size: 12px;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  line-height: 1.45;
`

const FieldLbl = styled.span`
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.elevated};
  margin-bottom: 10px;
`

const Toggle = styled.button<{ on: boolean }>`
  min-width: 52px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid
    ${(p) => (p.on ? (p.theme as AppTheme).colors.accent : (p.theme as AppTheme).colors.border)};
  background: ${(p) => (p.on ? (p.theme as AppTheme).colors.accentSoft : (p.theme as AppTheme).colors.elevated)};
  font-weight: 800;
  font-size: 13px;
`

const BtnRow = styled.div`
  display: flex;
  gap: 8px;
`

const Ghost = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: transparent;
  font-weight: 700;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
`

const Primary = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: none;
  background: ${(p) => (p.theme as AppTheme).colors.accent};
  color: #fff;
  font-weight: 800;
`

const DelBtn = styled.button`
  padding: 8px 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.sm}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.elevated};
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.theme as AppTheme).colors.danger};
`

function UserBudgetCard({ userName }: { userName: string }) {
  const { settings, setSettings } = useLedger()
  const [monthStr, setMonthStr] = useState(
    settings.monthlyLimit != null ? String(settings.monthlyLimit) : '',
  )
  const [yearStr, setYearStr] = useState(
    settings.yearlyLimit != null ? String(settings.yearlyLimit) : '',
  )

  const applyLimits = async () => {
    const mRaw = monthStr.trim()
    const yRaw = yearStr.trim()
    const m = mRaw === '' ? null : parseAmountInput(mRaw)
    const y = yRaw === '' ? null : parseAmountInput(yRaw)
    if (mRaw !== '' && m === null) return
    if (yRaw !== '' && y === null) return
    try {
      await setSettings({ monthlyLimit: m, yearlyLimit: y })
      setMonthStr(m != null ? String(m) : '')
      setYearStr(y != null ? String(y) : '')
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '저장에 실패했습니다.')
    }
  }

  const clearLimits = async () => {
    setMonthStr('')
    setYearStr('')
    try {
      await setSettings({ monthlyLimit: null, yearlyLimit: null })
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '저장에 실패했습니다.')
    }
  }

  return (
    <Card>
      <H>지출 한도 · {userName}</H>
      <Hint>선택한 사용자에게만 적용되는 월·연 한도입니다.</Hint>
      <FieldLbl>월 한도 (원)</FieldLbl>
      <Input
        inputMode="numeric"
        placeholder="비워두면 제한 없음"
        value={monthStr}
        onChange={(e) => setMonthStr(e.target.value)}
      />
      <FieldLbl>연 한도 (원)</FieldLbl>
      <Input
        inputMode="numeric"
        placeholder="비워두면 제한 없음"
        value={yearStr}
        onChange={(e) => setYearStr(e.target.value)}
      />
      <BtnRow>
        <Ghost type="button" onClick={clearLimits}>
          한도 지우기
        </Ghost>
        <Primary type="button" onClick={applyLimits}>
          저장
        </Primary>
      </BtnRow>
    </Card>
  )
}

export function SettingsView() {
  const {
    settings,
    setSettings,
    users,
    deleteUser,
    activeUserScope,
    getUserName,
  } = useLedger()

  const onDeleteUser = (id: string) => {
    if (!window.confirm(`${getUserName(id)} 사용자와 이 사용자의 모든 지출 내역을 삭제할까요?`)) return
    void deleteUser(id).catch((e: unknown) =>
      window.alert(e instanceof Error ? e.message : '삭제에 실패했습니다.'),
    )
  }

  return (
    <div>
      <Card>
        <H>화면</H>
        <Row>
          <span>다크 모드</span>
          <Toggle
            type="button"
            on={settings.colorMode === 'dark'}
            onClick={() => {
              void (async () => {
                try {
                  await setSettings({
                    colorMode: settings.colorMode === 'dark' ? 'light' : 'dark',
                  })
                } catch (e) {
                  window.alert(e instanceof Error ? e.message : '저장에 실패했습니다.')
                }
              })()
            }}
          >
            {settings.colorMode === 'dark' ? 'ON' : 'OFF'}
          </Toggle>
        </Row>
        <Hint>테마는 모든 사용자에게 공통으로 적용됩니다. 데이터는 JSON Server(db.json)에 저장됩니다.</Hint>
      </Card>
      <Card>
        <H>사용자</H>
        <Hint>상단 바에서도 사용자를 추가할 수 있습니다. 삭제 시 해당 사용자의 지출 내역이 모두 제거됩니다.</Hint>
        {users.length === 0 ? (
          <Hint>등록된 사용자가 없습니다.</Hint>
        ) : (
          users.map((u) => (
            <UserRow key={u.id}>
              <span>{u.name}</span>
              <DelBtn type="button" onClick={() => onDeleteUser(u.id)}>
                삭제
              </DelBtn>
            </UserRow>
          ))
        )}
      </Card>
      {activeUserScope === 'all' ? (
        <Card>
          <H>지출 한도</H>
          <Hint>사용자별 한도를 설정하려면 상단에서 사용자를 선택한 뒤, 다시 설정 탭으로 오세요.</Hint>
        </Card>
      ) : (
        <UserBudgetCard key={activeUserScope} userName={getUserName(activeUserScope)} />
      )}
    </div>
  )
}
