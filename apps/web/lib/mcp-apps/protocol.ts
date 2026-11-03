import { createMCPClient, mcpAppClientCapabilities } from '@ai-sdk/mcp'
import { inputRequiredSchema, mcpToolResultSchema, type CompanyToolName, type McpInputResponse } from './contracts'

export function getMcpUrl() {
  const configured = process.env.SP500_MCP_URL
  if (configured) return new URL(configured).toString()
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  return new URL('/mcp', origin).toString()
}

function requestHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  }
  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET)
    headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  return headers
}

export function createAppsClient(url = getMcpUrl()) {
  return createMCPClient({
    transport: { type: 'http', url, headers: requestHeaders() },
    capabilities: mcpAppClientCapabilities,
  })
}

export function parseRpcResponse(text: string, contentType: string) {
  const messages: unknown[] = contentType.includes('text/event-stream')
    ? text.split(/\r?\n\r?\n/).flatMap(event => {
        const data = event
          .split(/\r?\n/)
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).trimStart())
          .join('\n')
        return data && data !== '[DONE]' ? [JSON.parse(data)] : []
      })
    : [JSON.parse(text)]
  const response = messages.findLast(
    (message): message is Record<string, unknown> =>
      message !== null && typeof message === 'object' && ('result' in message || 'error' in message),
  )
  if (!response) throw new Error('The MCP server did not return a result.')
  if (response.error) {
    const error = response.error as Record<string, unknown>
    throw new Error(typeof error.message === 'string' ? error.message : 'The MCP request failed.')
  }
  return response.result
}

// Stateless MCP lets a workflow save input_required as plain data, release the
// network request, then retry after ctx.ask. No live client crosses a checkpoint.
export async function callMcpTool(
  name: CompanyToolName,
  args: Record<string, unknown>,
  continuation?: { requestState?: string; inputResponses: Record<string, McpInputResponse> },
  signal?: AbortSignal,
  url = getMcpUrl(),
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...requestHeaders(),
      'MCP-Protocol-Version': '2026-07-28',
      'Mcp-Method': 'tools/call',
      'Mcp-Name': name,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name,
        arguments: args,
        ...continuation,
        _meta: {
          'io.modelcontextprotocol/protocolVersion': '2026-07-28',
          'io.modelcontextprotocol/clientInfo': { name: 'sp500-online-agent', version: '1.0.0' },
          'io.modelcontextprotocol/clientCapabilities': { ...mcpAppClientCapabilities, elicitation: { form: {} } },
        },
      },
    }),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000),
    cache: 'no-store',
    redirect: 'error',
  })
  if (!response.ok) throw new Error(`The MCP server returned HTTP ${response.status}.`)
  const result = parseRpcResponse(await response.text(), response.headers.get('content-type') ?? '')
  const pending = inputRequiredSchema.safeParse(result)
  return pending.success
    ? { status: 'input_required' as const, pending: pending.data }
    : { status: 'completed' as const, result: mcpToolResultSchema.parse(result) }
}
