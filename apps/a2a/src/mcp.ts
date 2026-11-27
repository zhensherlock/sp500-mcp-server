import { Client, specTypeSchemas, StreamableHTTPClientTransport, withInputRequired } from '@modelcontextprotocol/client'

const mcpUrl = new URL(process.env.SP500_MCP_URL || 'http://localhost:3000/mcp')
const timeout = 10_000
const resultSchema = withInputRequired(specTypeSchemas.CallToolResult)

export async function callMcpTool(
  name: 'get_company_info' | 'get_company_financials' | 'get_company_news',
  args: Record<string, unknown>,
  selection?: { symbol: string; requestState?: string },
) {
  const client = new Client(
    { name: 'sp500-a2a', version: '0.1.0' },
    {
      capabilities: { elicitation: { form: {} } },
      versionNegotiation: { mode: { pin: '2026-07-28' } },
      inputRequired: { autoFulfill: false },
    },
  )

  const continuation = selection && {
    requestState: selection.requestState,
    inputResponses: { company: { action: 'accept' as const, content: { companyName: selection.symbol } } },
  }

  try {
    await client.connect(new StreamableHTTPClientTransport(mcpUrl), { timeout })
    return await client.request(
      { method: 'tools/call', params: { name, arguments: args, ...continuation } },
      resultSchema,
      { allowInputRequired: true, timeout },
    )
  } finally {
    await client.close()
  }
}
