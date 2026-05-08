import { useMcpToolApp } from '@/components/tool-app/use-mcp-tool-app'
import type { CompanyFilingsResult } from './types'
import { parseCompanyFilingsFromToolResult } from './utils'

export function useCompanyFilingsApp() {
  return useMcpToolApp<CompanyFilingsResult>({
    appName: 'SP500 Company Filings',
    parseResult: parseCompanyFilingsFromToolResult,
  })
}
