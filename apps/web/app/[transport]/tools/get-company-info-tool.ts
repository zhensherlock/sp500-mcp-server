import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/server'
import { registerAppTool } from '@modelcontextprotocol/ext-apps/server'
import { supabase } from '../utils/supabase'
import { getCompanySymbol } from '@/app/[transport]/utils'
import { registerHtmlAppResource } from './app-resource'

const RESOURCE_URI = 'ui://sp500/company-info.html'

const getCompanyInfoInputSchema = z.object({
  query: z.string().min(1),
})

export function registerGetCompanyInfoTool(mcpServer: McpServer) {
  registerAppTool(
    mcpServer,
    'get_company_info',
    {
      title: 'Get Company Info',
      description: 'Get complete company basic info, supports symbol and company name queries.',
      inputSchema: getCompanyInfoInputSchema,
      _meta: { ui: { resourceUri: RESOURCE_URI } },
    },
    async (params, ctx) => {
      const { query } = params

      const symbol = await getCompanySymbol({
        query,
        mcpServer,
        ctx,
      })
      if (typeof symbol !== 'string') return symbol

      const { data } = await supabase
        .from('company_info')
        .select(
          'symbol, shortName, longName, displayName, quoteType, address, city, zip, country, phone, website, irWebsite, sector, sectorKey, industry, industryKey, longBusinessSummary, fullTimeEmployees',
        )
        .eq('symbol', symbol)
        .single()

      if (!data) {
        return {
          content: [{ type: 'text', text: `No company info found for ${symbol}.` }],
        }
      }

      const result = data

      return {
        structuredContent: result,
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      }
    },
  )

  registerHtmlAppResource(mcpServer, RESOURCE_URI, 'company-info.html')
}
