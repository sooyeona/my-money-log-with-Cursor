import styled from '@emotion/styled'
import type { AppTheme } from '../theme'
import type { TabKey } from '../types'

const Bar = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0;
  padding: 6px 6px calc(6px + env(safe-area-inset-bottom));
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  border-top: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.06);
`

const Btn = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 2px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  color: ${(p) =>
    p.active ? (p.theme as AppTheme).colors.accent : (p.theme as AppTheme).colors.muted};
  background: ${(p) => (p.active ? (p.theme as AppTheme).colors.accentSoft : 'transparent')};
  font-size: 10px;
  font-weight: 600;
  min-width: 0;
`

const Icon = styled.span`
  font-size: 16px;
  line-height: 1;
`

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'day', label: '일별', icon: '◎' },
  { key: 'month', label: '월별', icon: '▦' },
  { key: 'year', label: '연도', icon: '▤' },
  { key: 'summary', label: '통합', icon: '∑' },
  { key: 'settings', label: '설정', icon: '⚙' },
]

interface Props {
  active: TabKey
  onChange: (k: TabKey) => void
}

export function BottomTabs({ active, onChange }: Props) {
  return (
    <Bar>
      {tabs.map((t) => (
        <Btn
          key={t.key}
          type="button"
          active={active === t.key}
          onClick={() => onChange(t.key)}
        >
          <Icon>{t.icon}</Icon>
          {t.label}
        </Btn>
      ))}
    </Bar>
  )
}
