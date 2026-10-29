import { useCallback, useLayoutEffect, useState } from 'react'
import { useApp, type McpUiHostContext } from '@modelcontextprotocol/ext-apps/react'

import type { AppStatus } from './types'
import { applyAppTheme } from './app-theme'

type UseMcpToolAppOptions<Result> = {
  appName: string
  parseResult: (toolResult: unknown) => Result
}

export function useMcpToolApp<Result>({ appName, parseResult }: UseMcpToolAppOptions<Result>) {
  const [result, setResult] = useState<Result | null>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>(undefined)
  const [parseError, setParseError] = useState<string | null>(null)

  const handleToolResult = useCallback(
    (toolResult: unknown) => {
      try {
        setResult(parseResult(toolResult))
        setParseError(null)
      } catch (error) {
        setResult(null)
        setParseError(error instanceof Error ? error.message : 'Failed to parse tool result.')
      }
    },
    [parseResult],
  )

  const { app, isConnected, error } = useApp({
    appInfo: { name: appName, version: '1.0.0' },
    capabilities: {},
    onAppCreated: app => {
      app.ontoolinput = input => {
        const nextQuery = input.arguments?.query
        setQuery(typeof nextQuery === 'string' ? nextQuery : null)
      }

      app.ontoolresult = handleToolResult

      app.onhostcontextchanged = () => {
        setHostContext(app.getHostContext())
      }

      app.onerror = event => {
        setResult(null)
        setParseError(event instanceof Error ? event.message : 'MCP App communication error.')
      }
    },
  })

  const currentHostContext = hostContext ?? app?.getHostContext()
  const theme = currentHostContext?.theme ?? 'light'

  useLayoutEffect(() => {
    applyAppTheme(theme)
  }, [theme])

  const status: AppStatus = error || parseError ? 'error' : isConnected ? 'ready' : 'connecting'

  return {
    app,
    error: error?.message ?? parseError,
    hostContext: currentHostContext,
    isConnected,
    query,
    result,
    status,
  }
}
