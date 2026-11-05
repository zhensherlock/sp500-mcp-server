'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useEveAgent, type EveMessage } from 'eve/react'
import { activeTurn, activity, idle, openInteractions } from 'eve/events'
import { Streamdown } from 'streamdown'
import { ArrowRight, ArrowUp, Check, Circle, AlertCircle, Info, Square } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { Bubble, BubbleContent } from '@workspace/ui/components/bubble'
import { Message as ConversationMessage, MessageContent } from '@workspace/ui/components/message'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Spinner } from '@workspace/ui/components/spinner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip'
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
  useMessageScroller,
} from '@workspace/ui/components/message-scroller'
import { companyTools, isMcpAppToolOutput } from '@/lib/mcp-apps/contracts'
import { messagesInEventOrder } from '@/lib/playground/message-order'
import { saveConversation, sessionPosition, type SavedSession } from '@/lib/playground/history'
import { sessionUnavailable } from '@/lib/playground/session-status'
import { CompanyChoice } from './CompanyChoice'
import { ConversationContext } from './ConversationContext'
import { ConversationSidebar } from './ConversationSidebar'
import { McpAppCard } from './McpAppCard'
import { Reasoning } from './Reasoning'
import { ToolCard, ToolData } from './ToolCard'

type Configuration = { configured: boolean; model: string; engine: string; contextWindow?: number }
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
  const [draft, setDraft] = useState('')
  const [storageError, setStorageError] = useState<string>()
  const startNew = useCallback((draft = '') => {
    setDraft(draft)
    setSelected(undefined)
    setActiveId(undefined)
    setKey(crypto.randomUUID())
  }, [])
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

  const persist = useCallback((item: SavedSession, activate: boolean) => {
    const next = saveConversation(savedRef.current, item)
    savedRef.current = next
    setSaved(next)
    if (activate) setActiveId(item.id)
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next))
    } catch {
      setStorageError('Browser storage is full. This conversation will remain available until you close the page.')
    }
  }, [])

  return (
    <TooltipProvider>
      <SidebarProvider className="relative min-h-0 flex-1">
        <ConversationSidebar
          sessions={saved}
          activeId={activeId}
          onNew={() => startNew()}
          onSelect={item => {
            if (activeId === item.id) return
            setDraft('')
            setSelected(item)
            setKey(item.id)
            setActiveId(item.id)
          }}
          onRemove={id => {
            const next = savedRef.current.filter(entry => entry.id !== id)
            savedRef.current = next
            setSaved(next)
            try {
              localStorage.setItem(STORAGE, JSON.stringify(next))
            } catch {
              setStorageError('Could not update browser storage.')
            }
            if (activeId === id) {
              startNew()
            }
          }}
        />
        <SidebarInset className="min-h-0 min-w-0">
          <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2 md:hidden">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">Conversations</span>
          </div>
          {error ? (
            <Alert variant="destructive" className="m-4 w-auto">
              <AlertCircle />
              <AlertTitle>Could not connect to the workspace</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <AlertAction>
                <Button variant="outline" size="sm" onClick={bootstrap}>
                  Retry
                </Button>
              </AlertAction>
            </Alert>
          ) : !config ? (
            <div
              role="status"
              aria-label="Preparing workspace"
              className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-8"
            >
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
          ) : (
            <ResearchSession
              key={key}
              initial={selected}
              initialInput={draft}
              config={config}
              persist={persist}
              onStartNew={startNew}
            />
          )}
          {storageError && (
            <Alert variant="destructive" className="mx-4 mb-3 w-auto">
              <AlertCircle />
              <AlertDescription>{storageError}</AlertDescription>
            </Alert>
          )}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function ResearchSession({
  initial,
  initialInput,
  config,
  persist,
  onStartNew,
}: {
  initial?: SavedSession
  initialInput: string
  config: Configuration
  persist: (item: SavedSession, activate: boolean) => void
  onStartNew: (draft: string) => void
}) {
  const agent = useEveAgent({
    baseUrl: '/api/playground',
    initialSession: initial?.session,
    initialEvents: initial?.events,
    resume: Boolean(initial),
    followWhile: view => !idle(view) || activeTurn(view) !== undefined,
  })
  const [input, setInput] = useState(initialInput)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [commandError, setCommandError] = useState<Error>()
  const [context, setContext] = useState<unknown>()
  const messages = useMemo(() => messagesInEventOrder(agent.messages, agent.events), [agent.messages, agent.events])
  const latestUserMessageId = messages.findLast(message => message.role === 'user')?.id
  const currentTurn = activeTurn(agent.view)
  const interactions = openInteractions(agent.view)
  const restoring = agent.status === 'resuming'
  const unavailable = sessionUnavailable(agent.view, agent.error, commandError)
  const busy = !restoring && !unavailable && (agent.status !== 'idle' || Boolean(currentTurn))
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
    (thinking && !interactions.length ? (
      <Reasoning text="" running />
    ) : (
      <div role="status" className="flex items-center gap-2 text-sm leading-6 text-muted-foreground">
        <Spinner aria-hidden="true" />
        {interactions.length ? 'Waiting for your choice' : 'Research in progress…'}
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
    let savedPosition = sessionPosition(initial)
    let mounted = true
    const save = () => {
      const { session, events, title } = snapshot.current
      if (!session || !events.length) return
      const position = sessionPosition({ session, events, title })
      if (position === savedPosition) return
      savedPosition = position
      persist({ id: session.sessionId, title, session, events, updated: Date.now() }, !initial && mounted)
    }
    const timer = setInterval(save, 1000)
    window.addEventListener('pagehide', save)
    return () => {
      clearInterval(timer)
      window.removeEventListener('pagehide', save)
      mounted = false
      save()
    }
  }, [persist, initial])

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || !config.configured || restoring || busy || unavailable) return
      setCommandError(undefined)
      agent
        .send(text.trim(), context ? { clientContext: { appSelection: JSON.stringify(context) } } : undefined)
        .then(() => setInput(''))
        .catch(error => setCommandError(error))
    },
    [agent, config.configured, context, restoring, busy, unavailable],
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
              disabled={!config.configured}
              className="min-h-24 resize-none px-5 pt-5 text-wrap"
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  if (!busy) send(input)
                }
              }}
            />
            <InputGroupAddon align="block-end" className="justify-end px-4 pb-4">
              <SessionSyncStatus active={restoring} />
              <ConversationContext view={agent.view} model={config.model} contextWindow={config.contextWindow} />
              <Tooltip>
                <TooltipTrigger asChild>
                  {busy ? (
                    <Button
                      type="button"
                      size="icon-lg"
                      variant="outline"
                      aria-label="Stop research"
                      onClick={() => agent.cancel().catch(error => setCommandError(error))}
                    >
                      <Square />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon-lg"
                      aria-label="Send question"
                      disabled={!input.trim() || !config.configured || restoring || unavailable}
                    >
                      <ArrowUp />
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>{busy ? 'Stop research' : 'Send question'}</TooltipContent>
              </Tooltip>
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
                <Alert>
                  <Info />
                  <AlertTitle>Connect a model to start researching</AlertTitle>
                  <AlertDescription>
                    Add <code className="text-xs">OPENAI_API_KEY</code> to the server environment, then restart the app.
                    Your key stays on the server.
                  </AlertDescription>
                </Alert>
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
                    <MessageScrollerItem key={message.id} messageId={message.id}>
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
                <CompanyChoice
                  prompt={interaction.request.prompt}
                  options={interaction.request.options ?? []}
                  disabled={restoring || unavailable}
                  onChoose={optionId => agent.respond([{ interactionId: interaction.interactionId, optionId }])}
                />
              </MessageScrollerItem>
            ))}
            {(unavailable || agent.error || commandError) && (
              <MessageScrollerItem>
                <Alert variant={unavailable ? 'default' : 'destructive'}>
                  <AlertCircle />
                  <AlertTitle>{unavailable ? 'Conversation ended' : 'Connection interrupted'}</AlertTitle>
                  <AlertDescription>
                    <p>
                      {unavailable
                        ? 'Previous messages remain available here. Start a new conversation to continue; your draft will be kept.'
                        : (commandError ?? agent.error)?.message}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (unavailable) {
                          onStartNew(input)
                          return
                        }
                        setCommandError(undefined)
                        agent.resume().catch(error => setCommandError(error))
                      }}
                    >
                      {unavailable ? 'Start new conversation' : 'Reconnect session'}
                    </Button>
                  </AlertDescription>
                </Alert>
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
      <FollowLatestMessage messageId={latestUserMessageId} />
    </MessageScrollerProvider>
  )
}

function FollowLatestMessage({ messageId }: { messageId?: string }) {
  const { scrollToEnd } = useMessageScroller()
  const previousMessageId = useRef(messageId)

  useLayoutEffect(() => {
    if (previousMessageId.current === messageId) return
    previousMessageId.current = messageId
    // Start following a new question without the spacer used by scrollAnchor.
    // Streaming updates then use the scroller's native follow/pause behavior.
    if (messageId) scrollToEnd({ behavior: 'auto' })
  }, [messageId, scrollToEnd])

  return null
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
      <ConversationMessage align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent asChild>
              <article className="whitespace-pre-wrap">
                {message.parts.map((part, index) =>
                  part.type === 'text' ? <span key={index}>{part.text}</span> : null,
                )}
              </article>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </ConversationMessage>
    )
  return (
    <ConversationMessage>
      <MessageContent>
        <article aria-label="Assistant response" className="flex min-w-0 flex-col gap-3 leading-7">
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
                      <Spinner aria-hidden="true" />
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
      </MessageContent>
    </ConversationMessage>
  )
}

function SessionSyncStatus({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    const timer = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(timer)
  }, [active])
  return active && visible ? (
    <span role="status" className="mr-auto flex items-center gap-2 text-xs text-muted-foreground">
      <Spinner aria-hidden="true" />
      Syncing conversation…
    </span>
  ) : null
}
