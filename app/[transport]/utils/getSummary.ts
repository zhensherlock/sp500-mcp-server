import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

type Options = {
  text: string
  mcpServer: McpServer
}

export async function getSummary(options: Options): Promise<string | undefined> {
  const { mcpServer, text } = options
  const capabilities = mcpServer.server.getClientCapabilities()
  if (!capabilities?.sampling) {
    return undefined
  }
  const response = await mcpServer.server.createMessage({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please concisely summarize the following:\n\n${text}`,
        },
      },
    ],
    maxTokens: 500,
  })
  return response.content.type === 'text' ? response.content.text || undefined : undefined
}
