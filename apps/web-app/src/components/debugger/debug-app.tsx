import { ResultPanel } from './result-panel'
import { ToolSidebar } from './tool-sidebar'
import { useDebuggerApp } from './use-debugger-app'

export function DebugApp() {
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
      <main className="grid min-h-screen place-items-center bg-neutral-100 font-sans text-neutral-900">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
          Loading MCP tools...
        </div>
      </main>
    )
  }

  if (toolLoadError || !selectedTool) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-100 font-sans text-neutral-900">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <p className="font-semibold">Cannot load MCP tools</p>
          <p className="mt-1">{toolLoadError ?? 'The MCP server did not return any tools.'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-100 font-sans text-neutral-900">
      <div className="grid min-h-screen lg:grid-cols-[24rem_1fr]">
        <ToolSidebar
          executionError={executionError}
          isExecuting={isExecuting}
          onExecuteTool={() => {
            void executeTool()
          }}
          onInputValuesChange={setToolInputValuesById}
          onSelectedToolIdChange={setSelectedToolId}
          selectedTool={selectedTool}
          toolArguments={toolArguments}
          toolInputValues={toolInputValues}
          tools={tools}
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
