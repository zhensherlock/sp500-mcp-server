import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { describe, expect, test } from 'vitest'

const mcpUrl = new URL('http://localhost:3000/mcp')

describe('MCP transport compatibility', () => {
  test('serves the current protocol over Streamable HTTP', async () => {
    const result = await global.client.listTools()

    expect(result.tools).toHaveLength(6)
  })

  test('serves legacy 2025 clients over the same Streamable HTTP endpoint', async () => {
    const transport = new StreamableHTTPClientTransport(new URL(mcpUrl))
    const client = new Client(
      { name: 'legacy-test-client', version: '1.0.0' },
      { versionNegotiation: { mode: 'legacy' } },
    )

    await client.connect(transport)

    try {
      const result = await client.listTools()
      expect(result.tools).toHaveLength(6)
    } finally {
      await client.close()
    }
  })

  test('acknowledges tool list subscriptions', async () => {
    const subscription = await global.client.listen({ toolsListChanged: true })

    try {
      expect(subscription.honoredFilter.toolsListChanged).toBe(true)
      expect((await global.client.listTools()).tools).toHaveLength(6)
    } finally {
      await subscription.close()
    }
  })
})
