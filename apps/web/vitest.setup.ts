import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'

const baseUrl = new URL('http://localhost:3000/mcp')
const streamableClientTransport = new StreamableHTTPClientTransport(new URL(baseUrl), {
  requestInit: {
    headers: {},
  },
})
const client = new Client(
  {
    name: 'test-client',
    version: '2.0.0',
  },
  { versionNegotiation: { mode: 'auto' } },
)

await client.connect(streamableClientTransport)

global.client = client
