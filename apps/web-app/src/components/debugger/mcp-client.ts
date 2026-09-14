import { Client, StreamableHTTPClientTransport, type Tool } from '@modelcontextprotocol/client'

import type { DebugTool } from './types'
import { createDebugTool } from './tool-schema'

function getMcpServerUrl() {
  return new URL('/mcp', window.location.origin)
}

let mcpClientPromise: Promise<Client> | null = null
let mcpToolsPromise: Promise<DebugTool[]> | null = null

export async function getMcpClient() {
  if (!mcpClientPromise) {
    mcpClientPromise = (async () => {
      const transport = new StreamableHTTPClientTransport(getMcpServerUrl(), {
        requestInit: {
          headers: {},
        },
      })
      const client = new Client(
        {
          name: 'sp500-debug-web-app',
          version: '2.0.0',
        },
        { versionNegotiation: { mode: 'auto' } },
      )

      await client.connect(transport)

      return client
    })()
  }

  return mcpClientPromise
}

export async function loadMcpTools() {
  if (!mcpToolsPromise) {
    mcpToolsPromise = (async () => {
      const client = await getMcpClient()
      const tools: Tool[] = []
      let cursor: string | undefined

      do {
        const result = await client.listTools(cursor ? { cursor } : undefined)
        tools.push(...result.tools)
        cursor = result.nextCursor
      } while (cursor)

      return tools.map(createDebugTool)
    })()
  }

  return mcpToolsPromise
}
