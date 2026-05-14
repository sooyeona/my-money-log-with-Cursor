import { ThemeProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { useMemo, useState } from 'react'
import type { AppTheme } from './theme'
import { buildTheme } from './theme'
import { LedgerProvider, useLedger } from './context/LedgerContext'
import { GlobalStyles } from './components/GlobalStyles'
import { BottomTabs } from './components/BottomTabs'
import { DayView } from './views/DayView'
import { MonthView } from './views/MonthView'
import { YearView } from './views/YearView'
import { SettingsView } from './views/SettingsView'
import { SummaryView } from './views/SummaryView'
import { UserScopeBar } from './components/UserScopeBar'
import type { TabKey } from './types'
import { todayISO } from './lib/dates'

const Shell = styled.div`
  max-width: 480px;
  margin: 0 auto;
  min-height: 100%;
  padding: 12px 16px calc(88px + env(safe-area-inset-bottom));
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-top: env(safe-area-inset-top);
`

const Brand = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.04em;
`

const Sub = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
`

const BootWrap = styled.div`
  max-width: 480px;
  margin: 0 auto;
  min-height: 100%;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  font-size: 15px;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
`

const BootTitle = styled.p`
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  color: ${(p) => (p.theme as AppTheme).colors.text};
`

const RetryBtn = styled.button`
  padding: 12px 20px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  border: none;
  background: ${(p) => (p.theme as AppTheme).colors.accent};
  color: #fff;
  font-weight: 800;
`

function AppWithTheme() {
  const { ready, loadError, retryLoad, settings } = useLedger()
  const theme = useMemo(() => buildTheme(settings.colorMode), [settings.colorMode])
  const [tab, setTab] = useState<TabKey>('day')
  const [anchor, setAnchor] = useState(todayISO)

  const monthKey = anchor.slice(0, 7)
  const year = Number(anchor.slice(0, 4))

  const body = useMemo(() => {
    if (tab === 'day') {
      return <DayView date={anchor} onChangeDate={setAnchor} />
    }
    if (tab === 'month') {
      return (
        <MonthView
          monthKey={monthKey}
          onChangeMonth={(mk) => setAnchor(`${mk}-01`)}
          onPickDay={(iso) => {
            setAnchor(iso)
            setTab('day')
          }}
        />
      )
    }
    if (tab === 'year') {
      return (
        <YearView
          year={year}
          onChangeYear={(y) => setAnchor(`${y}-${anchor.slice(5, 10)}`)}
          onPickMonth={(mk) => {
            setAnchor(`${mk}-01`)
            setTab('month')
          }}
        />
      )
    }
    if (tab === 'summary') {
      return <SummaryView anchor={anchor} />
    }
    if (tab === 'settings') {
      return <SettingsView />
    }
    return null
  }, [tab, anchor, monthKey, year])

  if (!ready) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <BootWrap>
          {loadError ? (
            <>
              <BootTitle>서버에 연결할 수 없습니다</BootTitle>
              <p style={{ margin: 0 }}>{loadError}</p>
              <p style={{ margin: 0, fontSize: 13 }}>
                터미널에서 <code style={{ fontSize: 12 }}>npm run dev</code> 로 JSON Server(3001)와
                Vite가 함께 실행되는지 확인해 주세요.
              </p>
              <RetryBtn type="button" onClick={() => void retryLoad()}>
                다시 시도
              </RetryBtn>
            </>
          ) : (
            <>
              <BootTitle>데이터 불러오는 중…</BootTitle>
              <p style={{ margin: 0 }}>잠시만 기다려 주세요.</p>
            </>
          )}
        </BootWrap>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Shell>
        <Header>
          <div>
            <Brand>가계부</Brand>
            <Sub>다사용자 · JSON Server</Sub>
          </div>
        </Header>
        <UserScopeBar />
        {body}
      </Shell>
      <BottomTabs active={tab} onChange={setTab} />
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <LedgerProvider>
      <AppWithTheme />
    </LedgerProvider>
  )
}
