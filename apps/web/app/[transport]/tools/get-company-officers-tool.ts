import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { supabase } from '../utils/supabase'
import { getCompanySymbol, getSummary } from '@/app/[transport]/utils'

const getCompanyOfficersParams = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(20),
})

export function registerGetCompanyOfficersTool(mcpServer: McpServer) {
  mcpServer.registerTool(
    'get_company_officers',
    {
      title: 'Get Company Officers',
      description: 'Get company executive officers and their compensation info, supports filtering by symbol',
      inputSchema: getCompanyOfficersParams,
    },
    async (params: z.infer<typeof getCompanyOfficersParams>) => {
      const { query, limit } = params

      const symbol = await getCompanySymbol({
        query,
        mcpServer: mcpServer,
      })

      const { data } = await supabase
        .from('company_officers')
        .select('name, age, title, totalPay')
        .eq('symbol', symbol)
        .order('totalPay', { ascending: false })
        .limit(limit)

      if (!data?.length) {
        return {
          content: [{ type: 'text', text: `No officers found for ${symbol}.` }],
        }
      }

      const summary = await getSummary({
        text: JSON.stringify({
          symbol,
          officers: data || [],
        }),
        mcpServer,
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              symbol,
              officers: data || [],
              summary,
            }),
          },
        ],
      }
    },
  )
}
