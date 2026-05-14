export interface User {
  id: string
  name: string
  createdAt: string
}

/** 사용자별 지출 한도 (json-server 리소스 id = 사용자 id) */
export interface UserBudget {
  id: string
  monthlyLimit: number | null
  yearlyLimit: number | null
}

/** 앱 공통 설정 (단일 행 id=1) */
export interface AppConfig {
  colorMode: 'light' | 'dark'
  /** "all" = 전체(통합) 보기, 그 외 = 사용자 id */
  activeUserScope: 'all' | string
}

export interface Transaction {
  id: string
  userId: string
  /** YYYY-MM-DD */
  date: string
  amount: number
  category: string
  memo: string
  sortOrder: number
  createdAt: string
}

/** UI용: 테마 + 현재 범위에 맞는 한도 */
export interface AppSettings {
  colorMode: 'light' | 'dark'
  monthlyLimit: number | null
  yearlyLimit: number | null
}

export type TabKey = 'day' | 'month' | 'year' | 'summary' | 'settings'
