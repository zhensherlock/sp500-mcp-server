import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { supabase } from '../utils/supabase'
import { getCompanySymbol, getSummary } from '@/app/[transport]/utils'
import { registerHtmlAppResource } from './app-resource'

const RESOURCE_URI = 'ui://sp500/company-info.html'

const getCompanyInfoParams = z.object({
  query: z.string().min(1),
})

export function registerGetCompanyInfoTool(mcpServer: McpServer) {
  mcpServer.registerTool(
    'get_company_info',
    {
      title: 'Get Company Info',
      description: 'Get complete company basic info, supports symbol and company name queries.',
      inputSchema: getCompanyInfoParams,
      _meta: { ui: { resourceUri: RESOURCE_URI } },
    },
    async (params: z.infer<typeof getCompanyInfoParams>) => {
      const { query } = params

      const symbol = await getCompanySymbol({
        query,
        mcpServer,
      })

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

      const summary = await getSummary({
        text: JSON.stringify(data),
        mcpServer,
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ...data,
              summary,
            }),
          },
        ],
      }
    },
  )

  registerHtmlAppResource(mcpServer, RESOURCE_URI, 'company-info.html')
}
