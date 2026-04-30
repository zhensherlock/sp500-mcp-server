import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const baseUrl = new URL('http://localhost:3000/mcp')
const streamableClientTransport = new StreamableHTTPClientTransport(new URL(baseUrl), {
  requestInit: {
    headers: {},
  },
})
const client = new Client({
  name: 'test-client',
  version: '1.0.0',
})

await client.connect(streamableClientTransport)

global.client = client
