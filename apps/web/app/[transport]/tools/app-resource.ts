import { registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server'
import type { McpServer } from '@modelcontextprotocol/server'
import { getRequestOrigin } from '@/app/mcp/request-context'
import fs from 'node:fs/promises'
import path from 'node:path'

const ASSET_BASE_SCRIPT_MARKER = '</head>'
const ASSET_BASE_GLOBAL = '__SP500_MCP_ASSET_BASE_URL__'

export function registerHtmlAppResource(mcpServer: McpServer, resourceUri: string, fileName: string) {
  registerAppResource(mcpServer, resourceUri, resourceUri, { mimeType: RESOURCE_MIME_TYPE }, async () => {
    const html = await fs.readFile(path.join(process.cwd(), '../web-app/dist', fileName), 'utf-8')
    const assetBaseUrl = getAssetBaseUrl()
    const resourceDomains = assetBaseUrl ? [assetBaseUrl] : undefined

    return {
      contents: [
        {
          uri: resourceUri,
          mimeType: RESOURCE_MIME_TYPE,
          text: injectAssetBaseUrl(html, assetBaseUrl),
          _meta: {
            ui: {
              csp: {
                resourceDomains,
              },
            },
          },
        },
      ],
    }
  })
}

function getAssetBaseUrl() {
  const configuredOrigin = normalizeOrigin(process.env.MCP_APP_ASSET_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL)
  const requestOrigin = normalizeOrigin(getRequestOrigin())
  const vercelOrigin = normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  const origin = configuredOrigin ?? requestOrigin ?? vercelOrigin

  return origin ?? null
}

function normalizeOrigin(value?: string | null) {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)

    return url.origin
  } catch {
    return null
  }
}

function injectAssetBaseUrl(html: string, assetBaseUrl: string | null) {
  if (!assetBaseUrl) {
    return html
  }

  const script = `<script>globalThis.${ASSET_BASE_GLOBAL}=${JSON.stringify(assetBaseUrl)};</script>`

  if (!html.includes(ASSET_BASE_SCRIPT_MARKER)) {
    return `${script}\n${html}`
  }

  return html.replace(ASSET_BASE_SCRIPT_MARKER, `${script}\n${ASSET_BASE_SCRIPT_MARKER}`)
}
