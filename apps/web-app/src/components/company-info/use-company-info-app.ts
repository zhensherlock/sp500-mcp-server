import { useMcpToolApp } from '@/components/tool-app/use-mcp-tool-app'

import type { CompanyInfo } from './types'
import { parseCompanyInfoFromToolResult } from './utils'

export function useCompanyInfoApp() {
  const { result: company, ...appState } = useMcpToolApp<CompanyInfo>({
    appName: 'SP500 Company Info',
    parseResult: parseCompanyInfoFromToolResult,
  })

  return {
    ...appState,
    company,
  }
}
