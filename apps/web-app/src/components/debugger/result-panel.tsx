import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@workspace/ui/components/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'

import { renderToolPreview } from './tool-preview'
import type { DebugTool } from './types'

type ResultPanelProps = {
  activeResultTab: string
  activeResultText: string
  activeResultTool?: DebugTool
  onActiveResultTabChange: (tab: string) => void
  onResultTextChange: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export function ResultPanel({
  activeResultTab,
  activeResultText,
  activeResultTool,
  onActiveResultTabChange,
  onResultTextChange,
}: ResultPanelProps) {
  const preview = activeResultTool ? renderToolPreview({ resultText: activeResultText, tool: activeResultTool }) : null

  return (
    <section className="min-w-0 bg-white" aria-label="Execution preview">
      {activeResultTool ? (
        <Tabs value={activeResultTab} onValueChange={onActiveResultTabChange} className="min-h-screen gap-0">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{activeResultTool.label}</p>
              <p className="mt-0.5 truncate font-mono text-xs text-neutral-500">{activeResultTool.mcpToolName}</p>
            </div>
            <TabsList>
              <TabsTrigger value="app">MCP App</TabsTrigger>
              <TabsTrigger value="result">Tool result</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="app" className="m-0 min-h-[calc(100vh-3.75rem)]">
            {preview?.error ? (
              <div className="p-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-semibold">Cannot render preview</p>
                  <p className="mt-1">{preview.error}</p>
                </div>
              </div>
            ) : (
              preview?.content
            )}
          </TabsContent>

          <TabsContent value="result" className="m-0 min-h-[calc(100vh-3.75rem)] bg-neutral-50 p-5">
            <textarea
              className="min-h-[calc(100vh-6.5rem)] w-full resize-none rounded-lg border border-neutral-300 bg-white p-3 font-mono text-xs leading-relaxed outline-none focus:border-neutral-500"
              onChange={event =>
                onResultTextChange(previous => ({
                  ...previous,
                  [activeResultTool.id]: event.target.value,
                }))
              }
              spellCheck={false}
              value={activeResultText}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid min-h-screen place-items-center p-8">
          <Empty className="max-w-md border border-neutral-200 bg-neutral-50">
            <EmptyHeader>
              <EmptyTitle>Ready to preview a tool</EmptyTitle>
              <EmptyDescription>
                Choose a tool, adjust its inputs, then execute it to render the MCP App view and inspect the raw tool
                result.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </section>
  )
}
