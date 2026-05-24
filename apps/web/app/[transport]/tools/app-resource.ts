import { registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { RequestInfo } from '@modelcontextprotocol/sdk/types.js'
import fs from 'node:fs/promises'
import path from 'node:path'

const ASSET_BASE_SCRIPT_MARKER = '</head>'
const ASSET_BASE_GLOBAL = '__SP500_MCP_ASSET_BASE_URL__'

export function registerHtmlAppResource(mcpServer: McpServer, resourceUri: string, fileName: string) {
  registerAppResource(mcpServer, resourceUri, resourceUri, { mimeType: RESOURCE_MIME_TYPE }, async (_uri, extra) => {
    const html = await fs.readFile(path.join(process.cwd(), '../web-app/dist', fileName), 'utf-8')
    const assetBaseUrl = getAssetBaseUrl(extra.requestInfo)
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

function getAssetBaseUrl(requestInfo?: RequestInfo) {
  const configuredOrigin = normalizeOrigin(process.env.MCP_APP_ASSET_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL)
  const requestOrigin = getPublicOrigin(requestInfo)
  const vercelOrigin = normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  const origin = configuredOrigin ?? requestOrigin ?? vercelOrigin

  return origin ?? null
}

function getPublicOrigin(requestInfo?: RequestInfo) {
  const headers = requestInfo?.headers
  const forwardedOrigin = getForwardedOrigin(headers)

  if (forwardedOrigin) {
    return forwardedOrigin
  }

  return normalizeOrigin(requestInfo?.url?.origin)
}

function getForwardedOrigin(headers?: RequestInfo['headers']) {
  const forwarded = getHeader(headers, 'forwarded')
  const forwardedParts = forwarded?.split(/[;,]/).map(part => part.trim())
  const forwardedHost = forwardedParts?.find(part => part.toLowerCase().startsWith('host='))?.slice('host='.length)
  const forwardedProto = forwardedParts?.find(part => part.toLowerCase().startsWith('proto='))?.slice('proto='.length)
  const host = stripHeaderQuotes(getHeader(headers, 'x-forwarded-host') ?? forwardedHost)

  if (!host) {
    return null
  }

  const proto = stripHeaderQuotes(getHeader(headers, 'x-forwarded-proto') ?? forwardedProto) ?? 'https'

  return normalizeOrigin(`${proto}://${host}`)
}

function getHeader(headers: RequestInfo['headers'] | undefined, name: string) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()]
  const firstValue = Array.isArray(value) ? value[0] : value

  return firstValue?.split(',')[0]?.trim() || null
}

function stripHeaderQuotes(value?: string | null) {
  return value?.replace(/^"|"$/g, '') ?? null
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
