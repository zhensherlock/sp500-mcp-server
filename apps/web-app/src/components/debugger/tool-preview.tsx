import { CompanyFilingsView } from '@/components/company-filings/company-filings-view'
import { parseCompanyFilingsFromToolResult } from '@/components/company-filings/utils'
import { CompanyFinancialsView } from '@/components/company-financials/company-financials-view'
import { parseCompanyFinancialsFromToolResult } from '@/components/company-financials/utils'
import { CompanyInfoCard } from '@/components/company-info/company-info-card'
import { parseCompanyInfoFromToolResult } from '@/components/company-info/utils'
import { CompanyNewsView } from '@/components/company-news/company-news-view'
import { parseCompanyNewsFromToolResult } from '@/components/company-news/utils'
import { CompanyOfficersView } from '@/components/company-officers/company-officers-view'
import { parseCompanyOfficersFromToolResult } from '@/components/company-officers/utils'
import { CompanyPriceDataView } from '@/components/company-price-data/company-price-data-view'
import { parseCompanyPriceDataFromToolResult } from '@/components/company-price-data/utils'

import type { DebugTool } from './types'

type ToolPreviewProps = {
  resultText: string
  tool: DebugTool
}

export function renderToolPreview({ resultText, tool }: ToolPreviewProps) {
  try {
    const result = JSON.parse(resultText)

    switch (tool.mcpToolName) {
      case 'get_company_filings':
        return { content: <CompanyFilingsView result={parseCompanyFilingsFromToolResult(result)} /> }
      case 'get_company_financials':
        return { content: <CompanyFinancialsView result={parseCompanyFinancialsFromToolResult(result)} /> }
      case 'get_company_info':
        return { content: <CompanyInfoCard company={parseCompanyInfoFromToolResult(result)} /> }
      case 'get_company_news':
        return { content: <CompanyNewsView result={parseCompanyNewsFromToolResult(result)} /> }
      case 'get_company_officers':
        return { content: <CompanyOfficersView result={parseCompanyOfficersFromToolResult(result)} /> }
      case 'get_company_price_data':
        return { content: <CompanyPriceDataView result={parseCompanyPriceDataFromToolResult(result)} /> }
      default:
        return {
          content: (
            <div className="p-8">
              <pre className="max-h-[calc(100vh-4rem)] overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-700">
                {resultText}
              </pre>
            </div>
          ),
        }
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Preview failed.',
    }
  }
}
