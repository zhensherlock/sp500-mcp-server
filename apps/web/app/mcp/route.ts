import { createMcpHandler, getPublicOrigin } from 'mcp-handler'
import {
  registerGetCompanyFilingsTool,
  registerGetCompanyFinancialsTool,
  registerGetCompanyInfoTool,
  registerGetCompanyNewsTool,
  registerGetCompanyOfficersTool,
  registerGetCompanyPriceDataTool,
} from '../[transport]/tools'
import { runWithRequestOrigin } from './request-context'

const mcpHandler = createMcpHandler(
  server => {
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
      version: '2.0.0',
    },
    maxSubscriptions: 0,
    verboseLogs: false,
  },
)

function handler(request: Request) {
  return runWithRequestOrigin(getPublicOrigin(request), () => mcpHandler(request))
}

export { handler as GET, handler as POST }
