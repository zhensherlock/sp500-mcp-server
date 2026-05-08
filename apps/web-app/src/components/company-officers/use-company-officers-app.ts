import { useMcpToolApp } from '@/components/tool-app/use-mcp-tool-app'

import type { CompanyOfficersResult } from './types'
import { parseCompanyOfficersFromToolResult } from './utils'

export function useCompanyOfficersApp() {
  return useMcpToolApp<CompanyOfficersResult>({
    appName: 'SP500 Company Officers',
    parseResult: parseCompanyOfficersFromToolResult,
  })
}
