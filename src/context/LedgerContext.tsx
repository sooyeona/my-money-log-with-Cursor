import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { AppConfig, AppSettings, Transaction, User, UserBudget } from '../types'
import * as api from '../lib/api'

interface LedgerContextValue {
  ready: boolean
  loadError: string | null
  retryLoad: () => Promise<void>
  /** 현재 보기(전체 | 사용자 id) */
  activeUserScope: 'all' | string
  setActiveUserScope: (scope: 'all' | string) => Promise<void>
  users: User[]
  addUser: (name: string) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  getUserName: (userId: string) => string
  /** 필터 적용된 거래(일/월/연 탭) */
  transactions: Transaction[]
  /** 통합 탭용 전체 거래 */
  allTransactions: Transaction[]
  settings: AppSettings
  setSettings: (patch: Partial<AppSettings>) => Promise<void>
  addTransaction: (input: Omit<Transaction, 'id' | 'sortOrder' | 'createdAt' | 'userId'>) => Promise<void>
  updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  reorderDay: (date: string, activeId: string, overId: string) => Promise<void>
  sumForDate: (date: string) => number
  sumForMonth: (monthKey: string) => number
  sumForYear: (year: number) => number
  sumForMonthByUser: (userId: string, monthKey: string) => number
  sumForYearByUser: (userId: string, year: number) => number
  transactionsForDateSorted: (date: string) => Transaction[]
}

const LedgerContext = createContext<LedgerContextValue | null>(null)

const defaultApp: AppConfig = { colorMode: 'light', activeUserScope: 'all' }

function nextSortOrder(list: Transaction[]): number {
  if (list.length === 0) return 0
  return Math.max(...list.map((t) => t.sortOrder)) + 1
}

function budgetsToMap(list: UserBudget[]): Map<string, UserBudget> {
  const m = new Map<string, UserBudget>()
  for (const b of list) {
    m.set(b.id, b)
  }
  return m
}

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userBudgets, setUserBudgets] = useState<UserBudget[]>([])
  const [app, setApp] = useState<AppConfig>(defaultApp)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const budgetMap = useMemo(() => budgetsToMap(userBudgets), [userBudgets])

  const activeUserScope = app.activeUserScope

  const visibleTransactions = useMemo(() => {
    if (activeUserScope === 'all') return allTransactions
    return allTransactions.filter((t) => t.userId === activeUserScope)
  }, [allTransactions, activeUserScope])

  const settings: AppSettings = useMemo(() => {
    const b =
      activeUserScope === 'all' ? null : (budgetMap.get(activeUserScope) ?? null)
    return {
      colorMode: app.colorMode,
      monthlyLimit: b?.monthlyLimit ?? null,
      yearlyLimit: b?.yearlyLimit ?? null,
    }
  }, [app.colorMode, activeUserScope, budgetMap])

  const loadAll = useCallback(async () => {
    setLoadError(null)
    setReady(false)
    try {
      const [txRaw, userList, budgetList, appRow] = await Promise.all([
        api.fetchTransactions(),
        api.fetchUsers(),
        api.fetchUserBudgets(),
        api.fetchApp(),
      ])

      let appData = api.appFromRow(appRow)
      const defaultUid = userList[0]?.id
      const txs: Transaction[] = txRaw.map((t) => ({
        ...t,
        userId: t.userId ?? defaultUid ?? 'unknown',
      }))

      if (
        appData.activeUserScope !== 'all' &&
        !userList.some((u) => u.id === appData.activeUserScope)
      ) {
        appData = { ...appData, activeUserScope: 'all' }
        await api.patchApp({ activeUserScope: 'all' })
      }

      setUsers(userList)
      setUserBudgets(budgetList)
      setApp(appData)
      setAllTransactions(txs)
      setReady(true)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 초기 로드·재시도 시 서버 상태와 맞추기 위함
    void loadAll()
  }, [loadAll])

  const setActiveUserScope = useCallback(async (scope: 'all' | string) => {
    const next = await api.patchApp({ activeUserScope: scope })
    setApp(next)
  }, [])

  const setSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      if (patch.colorMode !== undefined) {
        const nextApp = await api.patchApp({ colorMode: patch.colorMode })
        setApp(nextApp)
      }
      const uid = activeUserScope
      if (uid === 'all') return
      const budgetPatch: Partial<UserBudget> = {}
      if (patch.monthlyLimit !== undefined) budgetPatch.monthlyLimit = patch.monthlyLimit
      if (patch.yearlyLimit !== undefined) budgetPatch.yearlyLimit = patch.yearlyLimit
      if (Object.keys(budgetPatch).length === 0) return
      const updated = await api.patchUserBudget(uid, budgetPatch)
      setUserBudgets((prev) => {
        const i = prev.findIndex((b) => b.id === updated.id)
        if (i < 0) return [...prev, updated]
        const next = [...prev]
        next[i] = updated
        return next
      })
    },
    [activeUserScope],
  )

  const getUserName = useCallback(
    (userId: string) => users.find((u) => u.id === userId)?.name ?? '알 수 없음',
    [users],
  )

  const addUser = useCallback(async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = crypto.randomUUID()
    const user: User = { id, name: trimmed, createdAt: new Date().toISOString() }
    await api.createUser(user)
    await api.createUserBudget({ id, monthlyLimit: null, yearlyLimit: null })
    await loadAll()
  }, [loadAll])

  const deleteUser = useCallback(
    async (userId: string) => {
      const txs = allTransactions.filter((t) => t.userId === userId)
      await Promise.all(txs.map((t) => api.deleteTransactionRemote(t.id)))
      try {
        await api.deleteUserBudgetRemote(userId)
      } catch {
        /* 없을 수 있음 */
      }
      await api.deleteUserRemote(userId)
      await loadAll()
    },
    [allTransactions, loadAll],
  )

  const transactionsForDateSorted = useCallback(
    (date: string) =>
      visibleTransactions
        .filter((t) => t.date === date)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [visibleTransactions],
  )

  const sumForDate = useCallback(
    (date: string) =>
      visibleTransactions.filter((t) => t.date === date).reduce((a, t) => a + t.amount, 0),
    [visibleTransactions],
  )

  const sumForMonth = useCallback(
    (monthKey: string) =>
      visibleTransactions
        .filter((t) => t.date.startsWith(monthKey))
        .reduce((a, t) => a + t.amount, 0),
    [visibleTransactions],
  )

  const sumForYear = useCallback(
    (year: number) =>
      visibleTransactions
        .filter((t) => t.date.startsWith(String(year)))
        .reduce((a, t) => a + t.amount, 0),
    [visibleTransactions],
  )

  const sumForMonthByUser = useCallback(
    (userId: string, monthKey: string) =>
      allTransactions
        .filter((t) => t.userId === userId && t.date.startsWith(monthKey))
        .reduce((a, t) => a + t.amount, 0),
    [allTransactions],
  )

  const sumForYearByUser = useCallback(
    (userId: string, year: number) =>
      allTransactions
        .filter((t) => t.userId === userId && t.date.startsWith(String(year)))
        .reduce((a, t) => a + t.amount, 0),
    [allTransactions],
  )

  const addTransaction = useCallback(
    async (input: Omit<Transaction, 'id' | 'sortOrder' | 'createdAt' | 'userId'>) => {
      if (activeUserScope === 'all') {
        throw new Error('지출을 추가하려면 상단에서 사용자를 선택하세요.')
      }
      const uid = activeUserScope
      const sameDay = visibleTransactions.filter((t) => t.date === input.date && t.userId === uid)
      const tx: Transaction = {
        ...input,
        userId: uid,
        id: crypto.randomUUID(),
        sortOrder: nextSortOrder(sameDay),
        createdAt: new Date().toISOString(),
      }
      const created = await api.createTransaction(tx)
      setAllTransactions((prev) => [...prev, created])
    },
    [activeUserScope, visibleTransactions],
  )

  const updateTransaction = useCallback(
    async (id: string, patch: Partial<Transaction>) => {
      const current = allTransactions.find((t) => t.id === id)
      if (!current) return
      let body: Partial<Transaction> = { ...patch }
      if (patch.date && patch.date !== current.date) {
        const newDay = allTransactions.filter(
          (x) => x.date === patch.date && x.id !== id && x.userId === current.userId,
        )
        body = { ...body, sortOrder: nextSortOrder(newDay) }
      }
      const updated = await api.patchTransaction(id, body)
      setAllTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)))
    },
    [allTransactions],
  )

  const deleteTransaction = useCallback(async (id: string) => {
    await api.deleteTransactionRemote(id)
    setAllTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const reorderDay = useCallback(
    async (date: string, activeId: string, overId: string) => {
      if (activeUserScope === 'all') return
      if (activeId === overId) return
      const dayItems = visibleTransactions
        .filter((t) => t.date === date)
        .sort((a, b) => a.sortOrder - b.sortOrder)
      const oldIndex = dayItems.findIndex((t) => t.id === activeId)
      const newIndex = dayItems.findIndex((t) => t.id === overId)
      if (oldIndex < 0 || newIndex < 0) return
      const moved = arrayMove(dayItems, oldIndex, newIndex).map((t, i) => ({ ...t, sortOrder: i }))
      await Promise.all(moved.map((t) => api.patchTransaction(t.id, { sortOrder: t.sortOrder })))
      const uid = moved[0]?.userId ?? activeUserScope
      setAllTransactions((prev) => {
        const others = prev.filter((t) => !(t.date === date && t.userId === uid))
        return [...others, ...moved]
      })
    },
    [activeUserScope, visibleTransactions],
  )

  const value = useMemo(
    () => ({
      ready,
      loadError,
      retryLoad: loadAll,
      activeUserScope,
      setActiveUserScope,
      users,
      addUser,
      deleteUser,
      getUserName,
      transactions: visibleTransactions,
      allTransactions,
      settings,
      setSettings,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      reorderDay,
      sumForDate,
      sumForMonth,
      sumForYear,
      sumForMonthByUser,
      sumForYearByUser,
      transactionsForDateSorted,
    }),
    [
      ready,
      loadError,
      loadAll,
      activeUserScope,
      setActiveUserScope,
      users,
      addUser,
      deleteUser,
      getUserName,
      visibleTransactions,
      allTransactions,
      settings,
      setSettings,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      reorderDay,
      sumForDate,
      sumForMonth,
      sumForYear,
      sumForMonthByUser,
      sumForYearByUser,
      transactionsForDateSorted,
    ],
  )

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLedger(): LedgerContextValue {
  const ctx = useContext(LedgerContext)
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider')
  return ctx
}
