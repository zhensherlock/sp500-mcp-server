import { useMcpToolApp } from '@/components/tool-app/use-mcp-tool-app'

import type { CompanyNewsResult } from './types'
import { parseCompanyNewsFromToolResult } from './utils'

export function useCompanyNewsApp() {
  const state = useMcpToolApp<CompanyNewsResult>({
    appName: 'SP500 Company News',
    parseResult: parseCompanyNewsFromToolResult,
  })

  const { app, isConnected } = state
  const supportsTextMessages = isConnected && Boolean(app?.getHostCapabilities()?.message?.text)

  async function sendAnalysis(text: string) {
    if (!app || !isConnected || !app.getHostCapabilities()?.message?.text) {
      throw new Error('This host does not support sending text messages.')
    }

    return app.sendMessage({ role: 'user', content: [{ type: 'text', text }] }, { timeout: 15_000 })
  }

  return { ...state, sendAnalysis: supportsTextMessages ? sendAnalysis : undefined }
}
