import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import { supabase } from '../utils/supabase'
import { getCompanySymbol, getSummary } from '@/app/[transport]/utils'

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

  registerAppResource(mcpServer, RESOURCE_URI, RESOURCE_URI, { mimeType: RESOURCE_MIME_TYPE }, async () => {
    const html = await fs.readFile(path.join(process.cwd(), '../web-app/dist/company-info.html'), 'utf-8')
    return {
      contents: [{ uri: RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE, text: html }],
    }
  })
}
