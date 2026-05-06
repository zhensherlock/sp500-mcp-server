import { useEffect, useMemo, useState } from 'react'

import { getMcpClient, loadMcpTools } from './mcp-client'
import { buildToolArguments, createDefaultInputValuesById, formatJson } from './tool-arguments'
import type { DebugTool } from './types'

export function useDebuggerApp() {
  const [tools, setTools] = useState<DebugTool[]>([])
  const [selectedToolId, setSelectedToolId] = useState<string>('')
  const [activeResultToolId, setActiveResultToolId] = useState<string | null>(null)
  const [activeResultTab, setActiveResultTab] = useState('app')
  const [toolInputValuesById, setToolInputValuesById] = useState<Record<string, Record<string, string>>>({})
  const [toolResultTextById, setToolResultTextById] = useState<Record<string, string>>({})
  const [isLoadingTools, setIsLoadingTools] = useState(true)
  const [toolLoadError, setToolLoadError] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionError, setExecutionError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function initializeTools() {
      setIsLoadingTools(true)
      setToolLoadError(null)
      try {
        const loadedTools = await loadMcpTools()

        if (!isMounted) return

        setTools(loadedTools)
        setSelectedToolId(loadedTools[0]?.id ?? '')
        setToolInputValuesById(createDefaultInputValuesById(loadedTools))
      } catch (error) {
        if (!isMounted) return

        setToolLoadError(error instanceof Error ? error.message : 'Failed to load MCP tools.')
      } finally {
        if (isMounted) setIsLoadingTools(false)
      }
    }

    void initializeTools()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedTool = tools.find(tool => tool.id === selectedToolId)
  const activeResultTool = tools.find(tool => tool.id === activeResultToolId)
  const toolInputValues = selectedTool ? (toolInputValuesById[selectedTool.id] ?? {}) : {}
  const toolArguments = useMemo(
    () => (selectedTool ? buildToolArguments(selectedTool, toolInputValues) : {}),
    [selectedTool, toolInputValues],
  )
  const activeResultText = activeResultTool ? (toolResultTextById[activeResultTool.id] ?? '') : ''

  async function executeTool() {
    if (!selectedTool) return

    setIsExecuting(true)
    setExecutionError(null)

    try {
      const client = await getMcpClient()
      const result = await client.callTool({
        arguments: toolArguments,
        name: selectedTool.mcpToolName,
      })

      setToolResultTextById(previous => ({
        ...previous,
        [selectedTool.id]: formatJson(result),
      }))
      setActiveResultToolId(selectedTool.id)
      setActiveResultTab('app')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Tool execution failed.'
      setExecutionError(errorMessage)
      setToolResultTextById(previous => ({
        ...previous,
        [selectedTool.id]: formatJson({
          content: [
            {
              text: errorMessage,
              type: 'text',
            },
          ],
          isError: true,
        }),
      }))
      setActiveResultToolId(selectedTool.id)
      setActiveResultTab('app')
    } finally {
      setIsExecuting(false)
    }
  }

  return {
    activeResultTab,
    activeResultText,
    activeResultTool,
    executionError,
    executeTool,
    isExecuting,
    isLoadingTools,
    selectedTool,
    setActiveResultTab,
    setToolInputValuesById,
    setToolResultTextById,
    setSelectedToolId,
    toolArguments,
    toolInputValues,
    toolLoadError,
    tools,
  }
}
