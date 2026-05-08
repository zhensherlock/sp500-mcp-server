import { useMcpToolApp } from '@/components/tool-app/use-mcp-tool-app'

import type { CompanyNewsResult } from './types'
import { parseCompanyNewsFromToolResult } from './utils'

export function useCompanyNewsApp() {
  return useMcpToolApp<CompanyNewsResult>({
    appName: 'SP500 Company News',
    parseResult: parseCompanyNewsFromToolResult,
  })
}
