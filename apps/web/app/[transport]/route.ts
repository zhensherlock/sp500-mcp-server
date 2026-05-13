import { createMcpHandler } from 'mcp-handler'
import {
  registerGetCompanyInfoTool,
  registerGetCompanyNewsTool,
  registerGetCompanyOfficersTool,
  registerGetCompanyFilingsTool,
  registerGetCompanyFinancialsTool,
  registerGetCompanyPriceDataTool,
} from './tools'

const handler = createMcpHandler(
  async server => {
    registerGetCompanyInfoTool(server)
    registerGetCompanyNewsTool(server)
    registerGetCompanyOfficersTool(server)
    registerGetCompanyFilingsTool(server)
    registerGetCompanyFinancialsTool(server)
    registerGetCompanyPriceDataTool(server)
  },
  {
    serverInfo: {
      name: 'SP500-mcp',
      version: '1.0.0',
    },
  },
  {
    basePath: '/',
    verboseLogs: false,
    maxDuration: Number(process.env.MCP_MAX_DURATION) || 60,
    disableSse: false,
    redisUrl: process.env.REDIS_URL,
  },
)

export { handler as GET, handler as POST, handler as DELETE }
