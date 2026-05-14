export type ColorMode = 'light' | 'dark'

export interface AppTheme {
  mode: ColorMode
  colors: {
    bg: string
    surface: string
    elevated: string
    border: string
    text: string
    muted: string
    accent: string
    accentSoft: string
    danger: string
    warn: string
    ok: string
    overlay: string
  }
  radius: { sm: number; md: number; lg: number }
  shadow: string
  font: string
}

export function buildTheme(mode: ColorMode): AppTheme {
  const isDark = mode === 'dark'
  return {
    mode,
    colors: {
      bg: isDark ? '#0c0f12' : '#eef1f4',
      surface: isDark ? '#151a21' : '#ffffff',
      elevated: isDark ? '#1c232d' : '#f7f9fb',
      border: isDark ? '#2a3340' : '#d8dee6',
      text: isDark ? '#e8edf4' : '#12161c',
      muted: isDark ? '#8b97a8' : '#5c6675',
      accent: isDark ? '#6ea8fe' : '#2563eb',
      accentSoft: isDark ? 'rgba(110,168,254,0.14)' : 'rgba(37,99,235,0.10)',
      danger: isDark ? '#f87171' : '#dc2626',
      warn: isDark ? '#fbbf24' : '#d97706',
      ok: isDark ? '#4ade80' : '#16a34a',
      overlay: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(15,23,42,0.35)',
    },
    radius: { sm: 8, md: 12, lg: 16 },
    shadow: isDark ? '0 8px 28px rgba(0,0,0,0.45)' : '0 10px 30px rgba(15,23,42,0.08)',
    font: `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif`,
  }
}
