'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEveAgent, type EveMessage, type UseEveAgentSnapshot } from 'eve/react'
import { activeTurn, idle, openInteractions } from 'eve/events'
import { Streamdown } from 'streamdown'
import {
  ArrowRight,
  ArrowUp,
  Brain,
  Check,
  ChevronRight,
  Circle,
  FlaskConical,
  History,
  LoaderCircle,
  Plus,
  Square,
  Trash2,
  Wrench,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@workspace/ui/components/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@workspace/ui/components/message-scroller'
import { isMcpAppToolOutput } from '@/lib/mcp-apps/contracts'
import { messagesInEventOrder } from '@/lib/playground/message-order'
import { McpAppCard } from './McpAppCard'

type SavedSession = {
  id: string
  title: string
  updated: number
  session: NonNullable<UseEveAgentSnapshot['session']>
  events: UseEveAgentSnapshot['events']
}
type Configuration = { configured: boolean; model: string; engine: string }
const STORAGE = 'sp500-research-sessions-v1'
const examples = [
  {
    title: 'Understand a company',
    text: 'Give me an overview of NVIDIA, its leadership, and recent news.',
    detail: 'Overview · Leadership · News',
  },
  {
    title: 'Compare the fundamentals',
    text: 'Compare Apple and Microsoft using their latest available financials. Explain the reporting periods and key differences.',
    detail: 'Multiple companies · Financials',
  },
  {
    title: 'Connect the evidence',
    text: 'Research Tesla: review recent news, SEC filings, and available price history. Summarize what the data shows.',
    detail: 'News · Filings · Price history',
  },
]

export function Playground() {
  const [config, setConfig] = useState<Configuration>()
  const [error, setError] = useState<string>()
  const [saved, setSaved] = useState<SavedSession[]>([])
  const savedRef = useRef<SavedSession[]>([])
  const [activeId, setActiveId] = useState<string>()
  const [selected, setSelected] = useState<SavedSession>()
  const [key, setKey] = useState('new')
  const [storageError, setStorageError] = useState<string>()
  const bootstrap = useCallback(() => {
    setError(undefined)
    fetch('/api/playground/session', { method: 'POST' })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Could not start the playground.')
        setConfig(data)
      })
      .catch(error => setError(error.message))
  }, [])
  useEffect(() => {
    bootstrap()
    try {
      const items = JSON.parse(localStorage.getItem(STORAGE) ?? '[]') as SavedSession[]
      const valid = Array.isArray(items)
        ? items.filter(item => item.id && item.session?.sessionId && Array.isArray(item.events)).slice(0, 12)
        : []
      savedRef.current = valid
      setSaved(valid)
      if (valid[0]) {
        setSelected(valid[0])
        setKey(valid[0].id)
        setActiveId(valid[0].id)
      }
    } catch {
      setStorageError('Saved conversations could not be loaded.')
    }
  }, [bootstrap])

  const persist = useCallback((item: SavedSession) => {
    const next = [item, ...savedRef.current.filter(entry => entry.id !== item.id)].slice(0, 12)
    savedRef.current = next
    setSaved(next)
    setActiveId(item.id)
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next))
    } catch {
      setStorageError('Browser storage is full. This conversation will remain available until you close the page.')
    }
  }, [])

  return (
    <div className="mx-auto grid min-h-0 w-full max-w-312 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] lg:grid-rows-1">
      <aside className="min-h-0 min-w-0 overflow-y-auto border-b border-border px-4 py-4 sm:px-6 lg:border-r lg:border-b-0 lg:py-6">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            setSelected(undefined)
            setActiveId(undefined)
            setKey(crypto.randomUUID())
          }}
        >
          <Plus data-icon="inline-start" />
          New research
        </Button>
        <details className="mt-6 group" open>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-muted-foreground">
            <History className="size-3.5" />
            Recent conversations
            <ChevronRight className="ml-auto size-3 transition-transform group-open:rotate-90" />
          </summary>
          <div className="mt-3 flex gap-1 overflow-auto lg:max-h-[50vh] lg:flex-col">
            {saved.length ? (
              saved.map(item => (
                <div
                  key={item.id}
                  className="group/item flex min-w-40 items-center rounded-lg hover:bg-muted lg:min-w-0"
                >
                  <button
                    className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2.5 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring ${activeId === item.id ? 'bg-primary/7 text-primary' : 'text-muted-foreground'}`}
                    onClick={() => {
                      setSelected(item)
                      setKey(item.id)
                      setActiveId(item.id)
                    }}
                  >
                    {item.title}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.title} from this browser`}
                    className="shrink-0 text-muted-foreground"
                    onClick={() => {
                      const next = saved.filter(entry => entry.id !== item.id)
                      savedRef.current = next
                      setSaved(next)
                      try {
                        localStorage.setItem(STORAGE, JSON.stringify(next))
                      } catch {
                        setStorageError('Could not update browser storage.')
                      }
                      if (activeId === item.id) {
                        setSelected(undefined)
                        setActiveId(undefined)
                        setKey(crypto.randomUUID())
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="px-1 py-2 text-xs leading-5 text-muted-foreground">
                Your research will appear here.
                <br />
                Saved in this browser.
              </p>
            )}
          </div>
        </details>
      </aside>
      <main className="flex min-h-0 min-w-0 flex-col px-4 pt-5 sm:px-8 lg:px-12 lg:pt-6">
        <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className={`size-1.5 rounded-full ${config?.configured ? 'bg-primary' : 'bg-muted-foreground'}`} />
            {config?.configured ? 'Agent ready' : config ? 'Setup needed' : 'Connecting…'}
          </span>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">{config?.model ?? 'Eve agent'}</span>
        </div>
        {error ? (
          <div role="alert" className="mb-5 rounded-lg border border-destructive/30 bg-card p-4 text-sm">
            <p>{error}</p>
            <Button variant="outline" className="mt-3" onClick={bootstrap}>
              Reconnect
            </Button>
          </div>
        ) : !config ? (
          <div className="flex items-center gap-2 py-20 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Preparing workspace…
          </div>
        ) : (
          <ResearchSession key={key} initial={selected} config={config} persist={persist} />
        )}
        {storageError && (
          <p role="status" className="mt-3 text-xs text-destructive">
            {storageError}
          </p>
        )}
      </main>
    </div>
  )
}

function ResearchSession({
  initial,
  config,
  persist,
}: {
  initial?: SavedSession
  config: Configuration
  persist: (item: SavedSession) => void
}) {
  const agent = useEveAgent({
    baseUrl: '/api/playground',
    initialSession: initial?.session,
    initialEvents: initial?.events,
    resume: Boolean(initial),
    followWhile: view => !idle(view) || activeTurn(view) !== undefined,
  })
  const [input, setInput] = useState('')
  const [commandError, setCommandError] = useState<string>()
  const [context, setContext] = useState<unknown>()
  const messages = useMemo(() => messagesInEventOrder(agent.messages, agent.events), [agent.messages, agent.events])
  const currentTurn = activeTurn(agent.view)
  const interactions = openInteractions(agent.view)
  const busy = agent.status !== 'idle' || Boolean(currentTurn)
  const title =
    agent.messages
      .find(message => message.role === 'user')
      ?.parts.find(part => part.type === 'text')
      ?.text.slice(0, 70) ?? 'Untitled research'

  const snapshot = useRef({ session: agent.session, events: agent.events, title })
  snapshot.current = { session: agent.session, events: agent.events, title }

  useEffect(() => {
    let savedPosition = ''
    const save = () => {
      const { session, events, title } = snapshot.current
      if (!session || !events.length) return
      const position = `${session.sessionId}:${session.streamIndex}:${events.length}`
      if (position === savedPosition) return
      savedPosition = position
      persist({ id: session.sessionId, title, session, events, updated: Date.now() })
    }
    const timer = setInterval(save, 1000)
    window.addEventListener('pagehide', save)
    return () => {
      clearInterval(timer)
      window.removeEventListener('pagehide', save)
    }
  }, [persist])

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || !config.configured) return
      setCommandError(undefined)
      agent
        .send(text.trim(), context ? { clientContext: { appSelection: JSON.stringify(context) } } : undefined)
        .then(() => setInput(''))
        .catch(error => setCommandError(error.message))
    },
    [agent, config.configured, context],
  )
  const onContext = useCallback((value: unknown) => setContext(value), [])

  return (
    <MessageScrollerProvider autoScroll={agent.messages.length > 0} defaultScrollPosition={initial ? 'end' : 'start'}>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport aria-label="Research conversation">
          <MessageScrollerContent className="gap-7 py-3 pr-2">
            {!config.configured && (
              <MessageScrollerItem>
                <div role="status" className="rounded-xl border border-border bg-card p-4 text-sm leading-6">
                  <p className="font-medium">Connect a model to start researching</p>
                  <p className="text-muted-foreground">
                    Add <code className="text-xs">OPENAI_API_KEY</code> to the server environment, then restart the app.
                    Your key stays on the server.
                  </p>
                </div>
              </MessageScrollerItem>
            )}
            {!agent.messages.length ? (
              <MessageScrollerItem>
                <div className="py-3 sm:py-5">
                  <p className="mb-4 text-xs font-semibold tracking-widest text-primary uppercase">
                    S&amp;P 500 · Agent playground
                  </p>
                  <h1 className="max-w-xl text-4xl leading-[1.15] font-semibold tracking-tight sm:text-5xl">
                    A question.
                    <br />
                    <span className="text-muted-foreground">A path to the evidence.</span>
                  </h1>
                  <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                    Explore companies through an agent that chooses tools, connects findings, and brings the data into
                    view.
                  </p>
                  <div className="mt-9 divide-y border-y border-border">
                    {examples.map(example => (
                      <button
                        key={example.title}
                        onClick={() => {
                          setInput(example.text)
                        }}
                        className="group flex w-full items-center gap-4 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium transition-colors group-hover:text-primary">
                            {example.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{example.detail}</p>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              </MessageScrollerItem>
            ) : (
              <>
                {messages.map(message => (
                  <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === 'user'}>
                    <Message message={message} onMessage={send} onContext={onContext} />
                  </MessageScrollerItem>
                ))}
              </>
            )}
            {interactions.map(interaction => (
              <MessageScrollerItem key={interaction.interactionId} messageId={interaction.interactionId}>
                <div className="rounded-xl border border-primary/30 bg-card p-5">
                  <p className="mb-3 text-sm font-medium">{interaction.request.prompt}</p>
                  <div className="flex flex-wrap gap-2">
                    {interaction.request.options?.map(option => (
                      <Button
                        key={option.id}
                        variant="outline"
                        disabled={agent.status === 'resuming'}
                        onClick={() =>
                          agent
                            .respond([{ interactionId: interaction.interactionId, optionId: option.id }])
                            .catch(error => setCommandError(error.message))
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </MessageScrollerItem>
            ))}
            {(agent.error || commandError) && (
              <MessageScrollerItem>
                <div role="alert" className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
                  <p>{commandError ?? agent.error?.message}</p>
                  <Button
                    variant="outline"
                    className="mt-3 text-foreground"
                    onClick={() => agent.resume().catch(error => setCommandError(error.message))}
                  >
                    Reconnect session
                  </Button>
                </div>
              </MessageScrollerItem>
            )}
            {busy && (
              <MessageScrollerItem>
                <div role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LoaderCircle className="size-3.5 animate-spin" />
                  {interactions.length
                    ? 'Waiting for your choice'
                    : agent.status === 'resuming'
                      ? 'Restoring conversation…'
                      : 'Research in progress…'}
                </div>
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton aria-label="Scroll to bottom" className="rounded-full shadow-sm" size="icon" />
      </MessageScroller>
      <div className="shrink-0 bg-background pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <form
          onSubmit={event => {
            event.preventDefault()
            send(input)
          }}
        >
          <InputGroup className="rounded-xl bg-card shadow-sm">
            <InputGroupTextarea
              aria-label="Research question"
              placeholder="Ask about a company, or compare a few…"
              value={input}
              onChange={event => setInput(event.target.value)}
              maxLength={16000}
              disabled={!config.configured || agent.status === 'resuming'}
              className="min-h-20 resize-none px-4 pt-4 text-sm"
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  if (!busy) send(input)
                }
              }}
            />
            <InputGroupAddon align="block-end" className="px-3 pb-3">
              <span className="mr-auto flex items-center gap-1.5 text-[11px]">
                <Wrench className="size-3" />6 MCP tools<span className="mx-1">·</span>Interactive apps
              </span>
              {busy ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Stop research"
                  onClick={() => agent.cancel().catch(error => setCommandError(error.message))}
                >
                  <Square className="size-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send question"
                  disabled={!input.trim() || !config.configured}
                >
                  <ArrowUp className="size-4" />
                </Button>
              )}
            </InputGroupAddon>
          </InputGroup>
        </form>
        <p className="mt-2 text-center text-[10px] leading-5 text-muted-foreground">
          Inspect the sources. Data availability and reporting dates vary by company.
        </p>
      </div>
    </MessageScrollerProvider>
  )
}

function Message({
  message,
  onMessage,
  onContext,
}: {
  message: EveMessage
  onMessage: (message: string) => void
  onContext: (context: unknown) => void
}) {
  if (message.role === 'user')
    return (
      <article className="ml-auto max-w-[90%] rounded-2xl border border-border bg-card px-5 py-3 text-sm leading-6 whitespace-pre-wrap">
        {message.parts.map((part, index) => (part.type === 'text' ? <span key={index}>{part.text}</span> : null))}
      </article>
    )
  return (
    <article className="min-w-0 text-sm leading-7">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-primary">
        <FlaskConical className="size-3.5" />
        Research agent
      </div>
      {message.parts.map((part, index) => {
        if (part.type === 'text')
          return (
            <Streamdown key={part.id ?? index} isAnimating={part.state === 'streaming'}>
              {part.text}
            </Streamdown>
          )
        if (part.type === 'reasoning')
          return (
            <details
              key={part.id ?? index}
              className="my-3 rounded-lg border border-border px-4 py-2 text-muted-foreground"
            >
              <summary className="cursor-pointer text-xs font-medium">
                <Brain className="mr-2 inline size-3.5" />
                Thinking summary{part.state === 'streaming' ? '…' : ''}
              </summary>
              <div className="mt-3 text-xs leading-6">
                <Streamdown>{part.text}</Streamdown>
              </div>
            </details>
          )
        if (part.type === 'tool') {
          if (part.state === 'completed' && isMcpAppToolOutput(part.output))
            return (
              <McpAppCard
                key={part.callId}
                callId={part.callId}
                input={part.input}
                output={part.output}
                onMessage={onMessage}
                onContext={onContext}
              />
            )
          const failed = ['failed', 'rejected', 'cancelled'].includes(part.state)
          return (
            <details key={part.callId} className="my-3 rounded-lg border border-border px-4 py-3">
              <summary className="flex cursor-pointer items-center gap-2 text-xs">
                {failed ? (
                  <Circle className="size-3 text-destructive" />
                ) : part.state === 'completed' ? (
                  <Check className="size-3 text-primary" />
                ) : (
                  <LoaderCircle className="size-3 animate-spin text-primary" />
                )}
                <span className="font-medium">{part.label || part.name}</span>
                <span className="ml-auto text-muted-foreground">
                  Step {part.stepIndex + 1} · {part.state}
                </span>
              </summary>
              <pre className="mt-3 max-h-64 overflow-auto text-xs text-muted-foreground">
                {JSON.stringify(part.error ?? part.output ?? part.input ?? part.inputText, null, 2)}
              </pre>
            </details>
          )
        }
        return null
      })}
    </article>
  )
}
