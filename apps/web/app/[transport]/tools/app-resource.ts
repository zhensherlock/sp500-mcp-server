import { registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import fs from 'node:fs/promises'
import path from 'node:path'

export function registerHtmlAppResource(mcpServer: McpServer, resourceUri: string, fileName: string) {
  registerAppResource(mcpServer, resourceUri, resourceUri, { mimeType: RESOURCE_MIME_TYPE }, async () => {
    const html = await fs.readFile(path.join(process.cwd(), '../web-app/dist', fileName), 'utf-8')

    return {
      contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
    }
  })
}
