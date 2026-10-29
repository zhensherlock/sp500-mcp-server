import { applyDocumentTheme } from '@modelcontextprotocol/ext-apps'

export type AppTheme = 'light' | 'dark'

export function applyAppTheme(theme: AppTheme) {
  applyDocumentTheme(theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
