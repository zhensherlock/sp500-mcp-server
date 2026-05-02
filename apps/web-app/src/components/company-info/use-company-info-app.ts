import { useCallback, useState } from 'react'
import { useApp, type McpUiHostContext } from '@modelcontextprotocol/ext-apps/react'
import type { AppStatus, CompanyInfo } from './types'
import { parseCompanyInfoFromToolResult } from './utils'

export function useCompanyInfoApp() {
  const [company, setCompany] = useState<CompanyInfo | null>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>(undefined)
  const [parseError, setParseError] = useState<string | null>(null)

  const handleToolResult = useCallback((result: unknown) => {
    try {
      setCompany(parseCompanyInfoFromToolResult(result))
      setParseError(null)
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse tool result.')
    }
  }, [])

  const { isConnected, error } = useApp({
    appInfo: { name: 'SP500 Company Info', version: '1.0.0' },
    capabilities: {},
    onAppCreated: app => {
      app.ontoolinput = input => {
        const nextQuery = input.arguments?.query
        setQuery(typeof nextQuery === 'string' ? nextQuery : null)
      }

      app.ontoolresult = handleToolResult

      app.onhostcontextchanged = context => {
        setHostContext(previous => ({ ...previous, ...context }))
      }

      app.onerror = event => {
        setParseError(event instanceof Error ? event.message : 'MCP App communication error.')
      }
    },
  })

  const status: AppStatus = error || parseError ? 'error' : isConnected ? 'ready' : 'connecting'

  return {
    company,
    error: error?.message ?? parseError,
    hostContext,
    isConnected,
    query,
    status,
  }
}
