import { useMcpToolApp } from '@/components/tool-app/use-mcp-tool-app'
import type { CompanyFinancialsResult } from './types'
import { parseCompanyFinancialsFromToolResult } from './utils'

export function useCompanyFinancialsApp() {
  return useMcpToolApp<CompanyFinancialsResult>({
    appName: 'SP500 Company Financials',
    parseResult: parseCompanyFinancialsFromToolResult,
  })
}
