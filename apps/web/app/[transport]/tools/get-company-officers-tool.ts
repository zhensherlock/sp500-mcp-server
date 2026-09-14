import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/server'
import { registerAppTool } from '@modelcontextprotocol/ext-apps/server'
import { supabase } from '../utils/supabase'
import { getCompanySymbol } from '@/app/[transport]/utils'
import { registerHtmlAppResource } from './app-resource'

const RESOURCE_URI = 'ui://sp500/company-officers.html'

const getCompanyOfficersInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(20),
})

export function registerGetCompanyOfficersTool(mcpServer: McpServer) {
  registerAppTool(
    mcpServer,
    'get_company_officers',
    {
      title: 'Get Company Officers',
      description: 'Get company executive officers and their compensation info, supports filtering by symbol',
      inputSchema: getCompanyOfficersInputSchema,
      _meta: { ui: { resourceUri: RESOURCE_URI } },
    },
    async (params, ctx) => {
      const { query, limit } = params

      const symbol = await getCompanySymbol({
        query,
        mcpServer,
        ctx,
      })
      if (typeof symbol !== 'string') return symbol

      const { data } = await supabase
        .from('company_officers')
        .select('name, age, title, totalPay')
        .eq('symbol', symbol)
        .order('totalPay', { ascending: true })
        .limit(limit)

      if (!data?.length) {
        return {
          content: [{ type: 'text', text: `No officers found for ${symbol}.` }],
        }
      }

      const result = {
        symbol,
        officers: data || [],
      }

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

  registerHtmlAppResource(mcpServer, RESOURCE_URI, 'company-officers.html')
}
