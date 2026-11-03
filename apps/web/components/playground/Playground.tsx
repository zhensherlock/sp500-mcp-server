'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useEveAgent, type EveMessage, type UseEveAgentSnapshot } from 'eve/react'
import { activeTurn, activity, idle, openInteractions } from 'eve/events'
import { Streamdown } from 'streamdown'
import {
  ArrowRight,
  ArrowUp,
  Check,
  ChevronRight,
  Circle,
  History,
  LoaderCircle,
  Plus,
  Square,
  Trash2,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@workspace/ui/components/empty'
import { Field, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@workspace/ui/components/input-group'
import { cn } from '@workspace/ui/lib/utils'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@workspace/ui/components/message-scroller'
import { companyTools, isMcpAppToolOutput } from '@/lib/mcp-apps/contracts'
import { messagesInEventOrder } from '@/lib/playground/message-order'
import { McpAppCard } from './McpAppCard'
import { Reasoning } from './Reasoning'
import { ToolCard, ToolData } from './ToolCard'

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
    title: 'Explore NVIDIA',
    text: 'Give me an overview of NVIDIA, its leadership, and recent news.',
    detail: 'Overview · Leadership · News',
  },
  {
    title: 'Compare Apple & Microsoft',
    text: 'Compare Apple and Microsoft using their latest available financials. Explain the reporting periods and key differences.',
    detail: 'Multiple companies · Financials',
  },
  {
    title: 'Research Tesla',
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
    <div className="grid min-h-0 w-full flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[256px_minmax(0,1fr)] lg:grid-rows-1">
      <aside className="min-h-0 min-w-0 overflow-y-auto border-b border-border bg-background px-4 py-4 lg:border-r lg:border-b-0 lg:py-6">
        <Button
          variant="outline"
          className="h-11 w-full justify-start"
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
                <div key={item.id} className="group/item relative min-w-40 lg:min-w-0">
                  <button
                    type="button"
                    aria-current={activeId === item.id ? 'true' : undefined}
                    data-active={activeId === item.id}
                    title={item.title}
                    className="w-full min-w-0 rounded-lg px-3 py-2.5 pr-11 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    onClick={() => {
                      setSelected(item)
                      setKey(item.id)
                      setActiveId(item.id)
                    }}
                  >
                    <span className="block truncate">{item.title}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.title} from this browser`}
                    className="absolute inset-y-0 right-1 my-auto transition-opacity active:not-aria-[haspopup]:translate-y-0 [@media(hover:hover)]:opacity-0 group-hover/item:opacity-100 group-focus-within/item:opacity-100"
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
                    <Trash2 />
                  </Button>
                </div>
              ))
            ) : (
              <p className="hidden px-1 py-2 text-xs leading-5 text-muted-foreground lg:block">
                Your research will appear here.
                <br />
                Saved in this browser.
              </p>
            )}
          </div>
        </details>
      </aside>
      <main className="flex min-h-0 min-w-0 flex-col bg-card">
        {error ? (
          <div role="alert" className="m-4 rounded-lg border border-destructive/30 bg-card p-4 text-sm">
            <p>{error}</p>
            <Button variant="outline" className="mt-3" onClick={bootstrap}>
              Reconnect
            </Button>
          </div>
        ) : !config ? (
          <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Preparing workspace…
          </div>
        ) : (
          <ResearchSession key={key} initial={selected} config={config} persist={persist} />
        )}
        {storageError && (
          <p role="status" className="px-4 py-3 text-xs text-destructive">
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
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [commandError, setCommandError] = useState<string>()
  const [context, setContext] = useState<unknown>()
  const messages = useMemo(() => messagesInEventOrder(agent.messages, agent.events), [agent.messages, agent.events])
  const currentTurn = activeTurn(agent.view)
  const interactions = openInteractions(agent.view)
  const busy = agent.status !== 'idle' || Boolean(currentTurn)
  const thinking = activity(agent.view).kind === 'thinking'
  const streamingContent = messages
    .at(-1)
    ?.parts.some(part => (part.type === 'reasoning' || part.type === 'text') && part.state === 'streaming')
  const pendingTool = messages
    .at(-1)
    ?.parts.some(part => part.type === 'tool' && !['completed', 'failed', 'rejected', 'cancelled'].includes(part.state))
  const pending =
    busy &&
    !streamingContent &&
    !pendingTool &&
    (thinking && !interactions.length && agent.status !== 'resuming' ? (
      <Reasoning text="" running />
    ) : (
      <div role="status" className="flex items-center gap-2 text-sm leading-6 text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        {interactions.length
          ? 'Waiting for your choice'
          : agent.status === 'resuming'
            ? 'Restoring conversation…'
            : 'Research in progress…'}
      </div>
    ))
  const hasMessages = messages.length > 0
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
  const composer = (
    <form
      onSubmit={event => {
        event.preventDefault()
        send(input)
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="research-question" className="sr-only">
            Research question
          </FieldLabel>
          <InputGroup className="rounded-2xl bg-card shadow-sm">
            <InputGroupTextarea
              ref={inputRef}
              id="research-question"
              placeholder="Ask about a company, or compare a few…"
              value={input}
              onChange={event => setInput(event.target.value)}
              maxLength={16000}
              disabled={!config.configured || agent.status === 'resuming'}
              className="min-h-24 resize-none px-5 pt-5"
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  if (!busy) send(input)
                }
              }}
            />
            <InputGroupAddon align="block-end" className="justify-end px-4 pb-4">
              {busy ? (
                <Button
                  type="button"
                  size="icon-lg"
                  variant="outline"
                  aria-label="Stop research"
                  onClick={() => agent.cancel().catch(error => setCommandError(error.message))}
                >
                  <Square />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon-lg"
                  aria-label="Send question"
                  disabled={!input.trim() || !config.configured}
                >
                  <ArrowUp />
                </Button>
              )}
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
    </form>
  )
  const sourceNote = (
    <p className="text-center text-[11px] leading-5 text-muted-foreground">
      Inspect the sources. Data availability and reporting dates vary by company.
    </p>
  )

  return (
    <MessageScrollerProvider autoScroll={agent.messages.length > 0} defaultScrollPosition={initial ? 'end' : 'start'}>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport aria-label="Research conversation">
          <MessageScrollerContent
            className={cn(
              'mx-auto w-full max-w-5xl gap-5 px-4 py-6 sm:px-8',
              !hasMessages && 'max-w-3xl justify-center py-4 sm:py-8 lg:pb-24',
            )}
          >
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
            {!hasMessages ? (
              <MessageScrollerItem>
                <div className="flex flex-col gap-6">
                  <Empty className="items-stretch gap-8 p-0 text-left">
                    <EmptyHeader className="max-w-none items-start gap-3">
                      <EmptyTitle>
                        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                          What are you researching?
                        </h1>
                      </EmptyTitle>
                      <EmptyDescription>
                        Explore companies, compare fundamentals, and follow the evidence.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="max-w-none items-stretch gap-4">
                      {composer}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-xs text-muted-foreground">Try asking</span>
                        {examples.map(example => (
                          <Button
                            key={example.title}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="min-h-11"
                            title={example.detail}
                            onClick={() => {
                              setInput(example.text)
                              inputRef.current?.focus()
                            }}
                          >
                            {example.title}
                            <ArrowRight data-icon="inline-end" />
                          </Button>
                        ))}
                      </div>
                    </EmptyContent>
                  </Empty>
                  {sourceNote}
                </div>
              </MessageScrollerItem>
            ) : (
              <>
                {messages.map(message =>
                  message.role !== 'user' &&
                  !message.parts.length &&
                  !(message === messages.at(-1) && pending) ? null : (
                    <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === 'user'}>
                      <Message
                        message={message}
                        onMessage={send}
                        onContext={onContext}
                        pending={message === messages.at(-1) ? pending : undefined}
                      />
                    </MessageScrollerItem>
                  ),
                )}
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
            {pending && messages.at(-1)?.role !== 'assistant' && <MessageScrollerItem>{pending}</MessageScrollerItem>}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        {hasMessages && (
          <MessageScrollerButton aria-label="Scroll to bottom" className="rounded-full shadow-sm" size="icon" />
        )}
      </MessageScroller>
      {hasMessages && (
        <div className="shrink-0 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 sm:px-8">
            {composer}
            {sourceNote}
          </div>
        </div>
      )}
    </MessageScrollerProvider>
  )
}

function Message({
  message,
  onMessage,
  onContext,
  pending,
}: {
  message: EveMessage
  onMessage: (message: string) => void
  onContext: (context: unknown) => void
  pending?: ReactNode
}) {
  if (message.role === 'user')
    return (
      <article className="ml-auto max-w-[90%] rounded-2xl border border-border bg-card px-5 py-3 text-sm leading-6 whitespace-pre-wrap">
        {message.parts.map((part, index) => (part.type === 'text' ? <span key={index}>{part.text}</span> : null))}
      </article>
    )
  return (
    <article aria-label="Assistant response" className="flex min-w-0 flex-col gap-3 text-sm leading-7">
      {message.parts.map((part, index) => {
        if (part.type === 'text')
          return (
            <Streamdown key={part.id ?? index} isAnimating={part.state === 'streaming'}>
              {part.text}
            </Streamdown>
          )
        if (part.type === 'reasoning')
          return <Reasoning key={part.id ?? index} text={part.text} running={part.state === 'streaming'} />
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
          const failed = part.state === 'failed'
          const running = !['completed', 'failed', 'rejected', 'cancelled'].includes(part.state)
          const title =
            Object.entries(companyTools).find(([name]) => name === part.name)?.[1].title || part.label || part.name
          return (
            <ToolCard
              key={part.callId}
              title={title}
              icon={
                failed ? (
                  <Circle />
                ) : part.state === 'completed' ? (
                  <Check />
                ) : !running ? (
                  <Circle />
                ) : (
                  <LoaderCircle className="animate-spin motion-reduce:animate-none" />
                )
              }
              status={failed ? 'error' : running ? 'running' : undefined}
              description={!running ? <span className="capitalize">{part.state}</span> : undefined}
            >
              <ToolData value={part.error ?? part.output ?? part.input ?? part.inputText} error={failed} />
            </ToolCard>
          )
        }
        return null
      })}
      {pending}
    </article>
  )
}
