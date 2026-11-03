'use client'

import { useEffect, useMemo, useState } from 'react'
import { MCPAppRenderer, type MCPAppResource, type MCPAppBridgeHandlers } from '@ai-sdk/react'
import { AlertCircle, Check, ChevronRight, LoaderCircle, RefreshCw } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import {
  companyChoice,
  companyTools,
  type InputRequired,
  type McpAppToolOutput,
  type McpInputResponse,
} from '@/lib/mcp-apps/contracts'

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  const body = await response.json()
  if (!response.ok) throw new Error(body.error ?? 'The request failed.')
  return body
}

export function McpAppCard({
  output,
  input,
  callId,
  onMessage,
  onContext,
}: {
  output: McpAppToolOutput
  input: unknown
  callId: string
  onMessage: (message: string) => void
  onContext: (context: unknown) => void
}) {
  const [resource, setResource] = useState<MCPAppResource>()
  const [expanded, setExpanded] = useState(true)
  const [error, setError] = useState<string>()
  const [retry, setRetry] = useState(0)
  const [height, setHeight] = useState(480)
  const [selection, setSelection] = useState<{
    pending: InputRequired
    answer: (value: Record<string, McpInputResponse>) => void
  }>()
  useEffect(() => {
    const controller = new AbortController()
    setError(undefined)
    fetchJson(`/api/playground/resource?uri=${encodeURIComponent(output.resourceUri)}`, { signal: controller.signal })
      .then(setResource)
      .catch(error => {
        if (!controller.signal.aborted) setError(error.message)
      })
    return () => controller.abort()
  }, [output.resourceUri, retry])

  const handlers = useMemo<MCPAppBridgeHandlers>(
    () => ({
      allowedTools: Object.keys(companyTools),
      async callTool(params) {
        let response = await fetchJson('/api/playground/tool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        })
        for (let attempt = 0; response.status === 'input_required'; attempt++) {
          if (attempt >= 5) throw new Error('Please refine the company query.')
          const pending: InputRequired = response.pending
          const inputResponses = await new Promise<Record<string, McpInputResponse>>(answer =>
            setSelection({ pending, answer }),
          )
          setSelection(undefined)
          response = await fetchJson('/api/playground/tool', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...params, continuation: { requestState: pending.requestState, inputResponses } }),
          })
        }
        return response.result
      },
      async readResource({ uri }) {
        const app = await fetchJson(`/api/playground/resource?uri=${encodeURIComponent(uri)}`)
        return { contents: [{ uri, mimeType: app.mimeType, text: app.html }] }
      },
      openLink({ url }) {
        const target = new URL(url, window.location.origin)
        if (!['https:', 'http:'].includes(target.protocol)) throw new Error('Unsupported link.')
        window.open(target.href, '_blank', 'noopener,noreferrer')
        return {}
      },
      sendMessage(params) {
        const content = (params as { content?: { type: string; text?: string }[] })?.content
        const text = content
          ?.filter(part => part.type === 'text')
          .map(part => part.text ?? '')
          .join('\n')
          .trim()
        if (text) onMessage(text)
        return {}
      },
      updateModelContext(params) {
        onContext(params)
        return {}
      },
      requestDisplayMode() {
        return { mode: 'inline' }
      },
      onSizeChange({ height }) {
        if (height) setHeight(Math.max(220, Math.min(1200, height)))
      },
      onError(error) {
        setError(error.message)
      },
    }),
    [onMessage, onContext],
  )

  return (
    <Collapsible asChild open={expanded} onOpenChange={setExpanded}>
      <section
        className="my-4 overflow-hidden rounded-xl border border-border bg-card"
        aria-label={companyTools[output.toolName].title}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${companyTools[output.toolName].title}`}
            className="flex min-h-12 w-full items-center gap-2 px-4 py-3 text-left text-sm outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            {output.result.isError ? (
              <AlertCircle className="size-4 text-destructive" />
            ) : (
              <Check className="size-4 text-primary" />
            )}
            <span className="min-w-0 flex-1 truncate font-medium">{companyTools[output.toolName].title}</span>
            <span
              className="shrink-0 text-xs text-muted-foreground"
              title="Time spent executing the MCP tool; excludes model thinking and time waiting for your choice."
            >
              Tool time <span className="font-mono">{(output.elapsedMs / 1000).toFixed(1)}s</span>
            </span>
            <ChevronRight
              className={`size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount hidden={!expanded} className="border-t">
          <Tabs defaultValue="app" className="gap-0">
            <TabsList variant="line" className="mx-4 my-2">
              <TabsTrigger value="app">Interactive app</TabsTrigger>
              <TabsTrigger value="data">Tool data</TabsTrigger>
              <TabsTrigger value="input">Arguments</TabsTrigger>
            </TabsList>
            <TabsContent value="app" className="min-h-40">
              {selection && (
                <div className="border-y bg-muted/50 p-4">
                  {Object.entries(selection.pending.inputRequests).map(([key, request]) => (
                    <div key={key}>
                      <p className="mb-3 text-sm font-medium">{request.params.message}</p>
                      <div className="flex flex-wrap gap-2">
                        {companyChoice(request).options.map(option => (
                          <Button
                            key={option}
                            variant="outline"
                            onClick={() =>
                              selection.answer({
                                [key]: { action: 'accept', content: { [companyChoice(request).field]: option } },
                              })
                            }
                          >
                            {option}
                          </Button>
                        ))}
                        <Button variant="ghost" onClick={() => selection.answer({ [key]: { action: 'cancel' } })}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {error ? (
                <div role="alert" className="p-5 text-sm">
                  <p className="mb-3 text-destructive">{error}</p>
                  <Button variant="outline" onClick={() => setRetry(value => value + 1)}>
                    <RefreshCw data-icon="inline-start" />
                    Retry app
                  </Button>
                </div>
              ) : !resource ? (
                <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading interactive app…
                </div>
              ) : (
                <MCPAppRenderer
                  part={{
                    type: 'dynamic-tool',
                    toolName: output.toolName,
                    toolCallId: callId,
                    state: 'output-available',
                    input,
                    output: output.result,
                    toolMetadata: { app: { resourceUri: output.resourceUri, mimeType: 'text/html;profile=mcp-app' } },
                  }}
                  resource={resource}
                  handlers={handlers}
                  sandbox={{
                    url: '/mcp-app-sandbox',
                    title: companyTools[output.toolName].title,
                    className: 'w-full border-0',
                    style: { height },
                  }}
                  hostContext={{ theme: 'light', displayMode: 'inline', availableDisplayModes: ['inline'] }}
                />
              )}
            </TabsContent>
            <TabsContent value="data">
              <pre className="max-h-96 overflow-auto border-t p-4 text-xs leading-relaxed">
                {JSON.stringify(output.result.structuredContent ?? output.result.content, null, 2)}
              </pre>
            </TabsContent>
            <TabsContent value="input">
              <pre className="max-h-96 overflow-auto border-t p-4 text-xs">{JSON.stringify(input, null, 2)}</pre>
            </TabsContent>
          </Tabs>
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}
