import { useLayoutEffect, useState } from 'react'

import { applyAppTheme, type AppTheme } from '@/components/tool-app/app-theme'
import { ResultPanel } from './result-panel'
import { ToolSidebar } from './tool-sidebar'
import { useDebuggerApp } from './use-debugger-app'

export function DebugApp() {
  const [theme, setTheme] = useState<AppTheme>('light')

  useLayoutEffect(() => {
    applyAppTheme(theme)
  }, [theme])

  const {
    activeResultTab,
    activeResultText,
    activeResultTool,
    executionError,
    executeTool,
    isExecuting,
    isLoadingTools,
    selectedTool,
    setActiveResultTab,
    setSelectedToolId,
    setToolInputValuesById,
    setToolResultTextById,
    toolArguments,
    toolInputValues,
    toolLoadError,
    tools,
  } = useDebuggerApp()

  if (isLoadingTools) {
    return (
      <main className="grid min-h-screen place-items-center bg-secondary font-sans text-foreground">
        <div className="rounded-lg border border-border bg-background p-5 text-sm text-muted-foreground">
          Loading MCP tools...
        </div>
      </main>
    )
  }

  if (toolLoadError || !selectedTool) {
    return (
      <main className="grid min-h-screen place-items-center bg-secondary font-sans text-foreground">
        <div className="max-w-md rounded-lg border border-destructive/25 bg-destructive/10 p-5 text-sm text-destructive">
          <p className="font-semibold">Cannot load MCP tools</p>
          <p className="mt-1">{toolLoadError ?? 'The MCP server did not return any tools.'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-secondary font-sans text-foreground lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-full lg:min-h-0 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <ToolSidebar
          executionError={executionError}
          isExecuting={isExecuting}
          onExecuteTool={() => {
            void executeTool()
          }}
          onInputValuesChange={setToolInputValuesById}
          onSelectedToolIdChange={setSelectedToolId}
          onThemeChange={setTheme}
          selectedTool={selectedTool}
          toolArguments={toolArguments}
          toolInputValues={toolInputValues}
          tools={tools}
          theme={theme}
        />
        <ResultPanel
          activeResultTab={activeResultTab}
          activeResultText={activeResultText}
          activeResultTool={activeResultTool}
          onActiveResultTabChange={setActiveResultTab}
          onResultTextChange={setToolResultTextById}
        />
      </div>
    </main>
  )
}
