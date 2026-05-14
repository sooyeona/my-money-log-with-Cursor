import styled from '@emotion/styled'
import { useState } from 'react'
import type { AppTheme } from '../theme'
import { useLedger } from '../context/LedgerContext'

const Wrap = styled.div`
  margin-bottom: 12px;
`

const Scroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

const Chip = styled.button<{ active: boolean }>`
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid
    ${(p) =>
      p.active ? (p.theme as AppTheme).colors.accent : (p.theme as AppTheme).colors.border};
  background: ${(p) =>
    p.active ? (p.theme as AppTheme).colors.accentSoft : (p.theme as AppTheme).colors.surface};
  color: ${(p) => (p.theme as AppTheme).colors.text};
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
`

const AddRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  align-items: center;
`

const AddInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.elevated};
  font-size: 14px;
`

const AddBtn = styled.button`
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: none;
  background: ${(p) => (p.theme as AppTheme).colors.accent};
  color: #fff;
  font-weight: 800;
  font-size: 13px;
`

export function UserScopeBar() {
  const { users, activeUserScope, setActiveUserScope, addUser } = useLedger()
  const [name, setName] = useState('')

  const pick = (scope: 'all' | string) => {
    void setActiveUserScope(scope).catch((e: unknown) =>
      window.alert(e instanceof Error ? e.message : '전환에 실패했습니다.'),
    )
  }

  const submitAdd = () => {
    void (async () => {
      try {
        await addUser(name)
        setName('')
      } catch (e) {
        window.alert(e instanceof Error ? e.message : '사용자 추가에 실패했습니다.')
      }
    })()
  }

  return (
    <Wrap>
      <Scroll>
        <Chip type="button" active={activeUserScope === 'all'} onClick={() => pick('all')}>
          전체
        </Chip>
        {users.map((u) => (
          <Chip
            key={u.id}
            type="button"
            active={activeUserScope === u.id}
            onClick={() => pick(u.id)}
          >
            {u.name}
          </Chip>
        ))}
      </Scroll>
      <AddRow>
        <AddInput
          placeholder="새 사용자 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
        />
        <AddBtn type="button" onClick={submitAdd}>
          추가
        </AddBtn>
      </AddRow>
    </Wrap>
  )
}
