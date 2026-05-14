import { Global, css, useTheme } from '@emotion/react'
import type { AppTheme } from '../theme'

export function GlobalStyles() {
  const theme = useTheme() as AppTheme
  return (
    <Global
      styles={css`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
        html,
        body,
        #root {
          height: 100%;
        }
        body {
          margin: 0;
          font-family: ${theme.font};
          background: ${theme.colors.bg};
          color: ${theme.colors.text};
          -webkit-font-smoothing: antialiased;
          touch-action: manipulation;
        }
        button,
        input,
        select,
        textarea {
          font: inherit;
          color: inherit;
        }
        button {
          cursor: pointer;
          border: none;
          background: none;
        }
      `}
    />
  )
}
