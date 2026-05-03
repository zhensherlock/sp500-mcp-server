import { useCallback, useState } from 'react'
import { useApp } from '@modelcontextprotocol/ext-apps/react'
import type { AppStatus, CompanyOfficersResult } from './types'
import { parseCompanyOfficersFromToolResult } from './utils'

export function useCompanyOfficersApp() {
  const [result, setResult] = useState<CompanyOfficersResult | null>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const handleToolResult = useCallback((toolResult: unknown) => {
    try {
      setResult(parseCompanyOfficersFromToolResult(toolResult))
      setParseError(null)
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse tool result.')
    }
  }, [])

  const { isConnected, error } = useApp({
    appInfo: { name: 'SP500 Company Officers', version: '1.0.0' },
    capabilities: {},
    onAppCreated: app => {
      app.ontoolinput = input => {
        const nextQuery = input.arguments?.query
        setQuery(typeof nextQuery === 'string' ? nextQuery : null)
      }

      app.ontoolresult = handleToolResult

      app.onerror = event => {
        setParseError(event instanceof Error ? event.message : 'MCP App communication error.')
      }
    },
  })

  const status: AppStatus = error || parseError ? 'error' : isConnected ? 'ready' : 'connecting'

  return {
    error: error?.message ?? parseError,
    query,
    result,
    status,
  }
}
