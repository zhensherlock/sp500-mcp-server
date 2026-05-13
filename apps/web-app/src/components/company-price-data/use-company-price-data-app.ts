import { useMcpToolApp } from '@/components/tool-app/use-mcp-tool-app'
import type { CompanyPriceDataResult } from './types'
import { parseCompanyPriceDataFromToolResult } from './utils'

export function useCompanyPriceDataApp() {
  return useMcpToolApp<CompanyPriceDataResult>({
    appName: 'SP500 Company Price Data',
    parseResult: parseCompanyPriceDataFromToolResult,
  })
}
