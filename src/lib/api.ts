import type { AppConfig, Transaction, User, UserBudget } from '../types'

const APP_ID = 1

function baseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (env != null && env !== '') return env.replace(/\/$/, '')
  return '/api'
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!res.ok) {
    throw new Error(text || res.statusText || `HTTP ${res.status}`)
  }
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

function headersJson(): HeadersInit {
  return { 'Content-Type': 'application/json' }
}

export type AppRow = AppConfig & { id: number }

export function appFromRow(row: AppRow): AppConfig {
  return {
    colorMode: row.colorMode === 'dark' ? 'dark' : 'light',
    activeUserScope:
      row.activeUserScope === 'all' || row.activeUserScope == null ? 'all' : String(row.activeUserScope),
  }
}

export async function fetchApp(): Promise<AppRow> {
  const res = await fetch(`${baseUrl()}/app/${APP_ID}`)
  return parseJson<AppRow>(res)
}

export async function patchApp(patch: Partial<AppConfig>): Promise<AppConfig> {
  const res = await fetch(`${baseUrl()}/app/${APP_ID}`, {
    method: 'PATCH',
    headers: headersJson(),
    body: JSON.stringify(patch),
  })
  const row = await parseJson<AppRow>(res)
  return appFromRow(row)
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${baseUrl()}/users`)
  return parseJson<User[]>(res)
}

export async function createUser(user: User): Promise<User> {
  const res = await fetch(`${baseUrl()}/users`, {
    method: 'POST',
    headers: headersJson(),
    body: JSON.stringify(user),
  })
  return parseJson<User>(res)
}

export async function deleteUserRemote(id: string): Promise<void> {
  const res = await fetch(`${baseUrl()}/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || res.statusText)
  }
}

export async function fetchUserBudgets(): Promise<UserBudget[]> {
  const res = await fetch(`${baseUrl()}/userBudgets`)
  return parseJson<UserBudget[]>(res)
}

export async function createUserBudget(budget: UserBudget): Promise<UserBudget> {
  const res = await fetch(`${baseUrl()}/userBudgets`, {
    method: 'POST',
    headers: headersJson(),
    body: JSON.stringify(budget),
  })
  return parseJson<UserBudget>(res)
}

export async function patchUserBudget(id: string, patch: Partial<UserBudget>): Promise<UserBudget> {
  const res = await fetch(`${baseUrl()}/userBudgets/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headersJson(),
    body: JSON.stringify(patch),
  })
  return parseJson<UserBudget>(res)
}

export async function deleteUserBudgetRemote(id: string): Promise<void> {
  const res = await fetch(`${baseUrl()}/userBudgets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || res.statusText)
  }
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${baseUrl()}/transactions`)
  return parseJson<Transaction[]>(res)
}

export async function createTransaction(tx: Transaction): Promise<Transaction> {
  const res = await fetch(`${baseUrl()}/transactions`, {
    method: 'POST',
    headers: headersJson(),
    body: JSON.stringify(tx),
  })
  return parseJson<Transaction>(res)
}

export async function patchTransaction(id: string, patch: Partial<Transaction>): Promise<Transaction> {
  const res = await fetch(`${baseUrl()}/transactions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headersJson(),
    body: JSON.stringify(patch),
  })
  return parseJson<Transaction>(res)
}

export async function deleteTransactionRemote(id: string): Promise<void> {
  const res = await fetch(`${baseUrl()}/transactions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || res.statusText)
  }
}
