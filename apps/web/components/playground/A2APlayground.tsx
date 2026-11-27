'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowRight, ArrowUp } from 'lucide-react'
import { z } from 'zod'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Bubble, BubbleContent } from '@workspace/ui/components/bubble'
import { Button } from '@workspace/ui/components/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@workspace/ui/components/empty'
import { Field, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@workspace/ui/components/input-group'
import { Message, MessageContent } from '@workspace/ui/components/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@workspace/ui/components/message-scroller'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar'
import { Spinner } from '@workspace/ui/components/spinner'
import { TooltipProvider } from '@workspace/ui/components/tooltip'
import { cn } from '@workspace/ui/lib/utils'
import { a2aReplySchema, type A2AContinuation } from '@/lib/a2a-playground/contracts'
import { A2AExecution } from './A2AExecution'
import { CompanyChoice } from './CompanyChoice'
import { ConversationSidebar } from './ConversationSidebar'

const storageKey = 'sp500-a2a-playground-v1'
const examples = ['XOM', 'Bank', 'AAPL']
const conversationSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  turns: z.array(z.object({ id: z.uuid(), input: z.string(), reply: a2aReplySchema })),
})
type Conversation = z.infer<typeof conversationSchema>

class A2ARequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function requestReply(
  payload: { text: string; continuation?: A2AContinuation } | { continuation: A2AContinuation },
  signal: AbortSignal,
) {
  const response = await fetch('/api/a2a-playground/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new A2ARequestError(body?.error ?? 'The A2A request failed. Please retry.', response.status)
  }
  const parsed = a2aReplySchema.safeParse(body)
  if (!parsed.success) throw new Error('The A2A agent returned an invalid reply. Please retry.')
  return parsed.data
}

function FollowLatest({ message }: { message?: string }) {
  const { scrollToEnd } = useMessageScroller()
  const previous = useRef(message)
  useLayoutEffect(() => {
    if (previous.current === message) return
    previous.current = message
    if (message) scrollToEnd({ behavior: 'auto' })
  }, [message, scrollToEnd])
  return null
}

function UserMessage({ text }: { text: string }) {
  return (
    <Message align="end">
      <MessageContent>
        <Bubble variant="muted" align="end">
          <BubbleContent className="whitespace-pre-wrap">{text}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

export function A2APlayground() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const savedRef = useRef<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>()
  const [ready, setReady] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState('')
  const [error, setError] = useState<string>()
  const [trackingError, setTrackingError] = useState<{ message: string; retryable: boolean }>()
  const [trackingAttempt, setTrackingAttempt] = useState(0)
  const [storageError, setStorageError] = useState<string>()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const request = useRef<AbortController | null>(null)
  const active = conversations.find(item => item.id === activeId)
  const turns = active?.turns ?? []
  const lastTurn = turns.at(-1)
  const runningTurn = lastTurn?.reply.running ? lastTurn.id : undefined
  const { taskId, contextId, proof } = lastTurn?.reply.running ? lastTurn.reply.continuation : {}
  const busy = !!(sending || runningTurn)
  const hasMessages = !!(turns.length || sending)

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
      const saved = z.array(conversationSchema).parse(cached).slice(0, 12)
      savedRef.current = saved
      setConversations(saved)
      setActiveId(saved[0]?.id)
    } catch {
      setStorageError('Saved conversations could not be loaded.')
    }
    setReady(true)
    return () => request.current?.abort()
  }, [])

  const save = useCallback((next: Conversation[]) => {
    savedRef.current = next
    setConversations(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      setStorageError('This browser could not save your conversations.')
    }
  }, [])

  useEffect(() => {
    if (!activeId || !runningTurn || !taskId || !contextId || !proof) return
    const controller = new AbortController()
    const deadline = AbortSignal.timeout(55_000)
    const signal = AbortSignal.any([controller.signal, deadline])
    const continuation = { taskId, contextId, proof }

    async function track() {
      while (!signal.aborted) {
        const reply = await requestReply({ continuation }, signal)
        if (signal.aborted) break
        const saved = savedRef.current
        const current = saved.find(item => item.id === activeId)
        const turn = current?.turns.at(-1)
        if (!current || !turn || turn.id !== runningTurn) return
        if (JSON.stringify(turn.reply) !== JSON.stringify(reply)) {
          const updated = { ...current, turns: [...current.turns.slice(0, -1), { ...turn, reply }] }
          save(saved.map(item => (item.id === activeId ? updated : item)))
        }
        if (!reply.running) return
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    void track()
      .catch(error => {
        if (controller.signal.aborted || deadline.aborted) return
        setTrackingError({
          message: error instanceof Error ? error.message : 'Could not check the task status.',
          retryable: !(error instanceof A2ARequestError && error.status === 409),
        })
      })
      .finally(() => {
        if (deadline.aborted && !controller.signal.aborted) {
          setTrackingError({ message: 'The agent is taking longer than expected.', retryable: true })
        }
      })
    return () => controller.abort()
  }, [activeId, contextId, proof, runningTurn, save, taskId, trackingAttempt])

  function open(id?: string) {
    request.current?.abort()
    request.current = null
    setSending('')
    setError(undefined)
    setTrackingError(undefined)
    setInput('')
    setActiveId(id)
  }

  async function send(value: string) {
    const text = value.trim()
    if (!ready || !text || runningTurn || request.current) return
    const controller = new AbortController()
    request.current = controller
    setSending(text)
    setError(undefined)
    try {
      const reply = await requestReply({ text, continuation: lastTurn?.reply.continuation }, controller.signal)
      if (controller.signal.aborted) return
      const next = {
        id: active?.id ?? crypto.randomUUID(),
        title: active?.title ?? text.slice(0, 70),
        turns: [...turns, { id: crypto.randomUUID(), input: text, reply }],
      }
      save([next, ...savedRef.current.filter(item => item.id !== next.id)].slice(0, 12))
      setActiveId(next.id)
      setInput('')
    } catch (error) {
      if (!controller.signal.aborted) throw error
    } finally {
      if (request.current === controller) {
        request.current = null
        setSending('')
      }
    }
  }

  function submit() {
    void send(input).catch(error => {
      setError(error instanceof Error ? error.message : 'The A2A request failed. Please retry.')
    })
  }

  const composer = (
    <form
      onSubmit={event => {
        event.preventDefault()
        submit()
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="a2a-company" className="sr-only">
            Company name or ticker
          </FieldLabel>
          <InputGroup className="rounded-2xl bg-card shadow-sm">
            <InputGroupTextarea
              ref={inputRef}
              id="a2a-company"
              placeholder="Enter a company name or ticker…"
              value={input}
              onChange={event => setInput(event.target.value)}
              maxLength={512}
              disabled={!ready || busy}
              className="min-h-24 resize-none px-5 pt-5 text-wrap"
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  submit()
                }
              }}
            />
            <InputGroupAddon align="block-end" className="justify-end px-4 pb-4">
              <Button type="submit" size="icon-lg" aria-label="Send message" disabled={!ready || !input.trim() || busy}>
                {sending ? <Spinner /> : <ArrowUp />}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
    </form>
  )

  return (
    <TooltipProvider>
      <SidebarProvider className="relative min-h-0 flex-1">
        <ConversationSidebar
          sessions={conversations}
          activeId={activeId}
          newLabel="New brief"
          onNew={() => open()}
          onSelect={item => {
            if (item.id !== activeId) open(item.id)
          }}
          onRemove={id => {
            if (id === activeId) open()
            save(savedRef.current.filter(item => item.id !== id))
          }}
        />
        <SidebarInset className="min-h-0 min-w-0">
          <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2 md:hidden">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">Conversations</span>
          </div>
          <MessageScrollerProvider key={activeId ?? 'new'} autoScroll={hasMessages} defaultScrollPosition="end">
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport aria-label="A2A conversation">
                <MessageScrollerContent
                  className={cn(
                    'mx-auto w-full max-w-5xl gap-5 px-4 py-6 sm:px-8',
                    !hasMessages && 'max-w-3xl justify-center py-4 sm:py-8 lg:pb-24',
                  )}
                >
                  {!hasMessages && (
                    <MessageScrollerItem>
                      <Empty className="items-stretch gap-8 p-0 text-left">
                        <EmptyHeader className="max-w-none items-start gap-3">
                          <EmptyTitle>
                            <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                              A2A Playground
                            </h1>
                          </EmptyTitle>
                          <EmptyDescription>
                            Get a company brief with annual financials and the latest available news.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent className="max-w-none items-stretch gap-4">
                          {composer}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-xs text-muted-foreground">Try a company</span>
                            {examples.map(example => (
                              <Button
                                key={example}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="min-h-11"
                                onClick={() => {
                                  setInput(example)
                                  inputRef.current?.focus()
                                }}
                              >
                                {example}
                                <ArrowRight data-icon="inline-end" />
                              </Button>
                            ))}
                          </div>
                        </EmptyContent>
                      </Empty>
                    </MessageScrollerItem>
                  )}
                  {turns.map(turn => (
                    <MessageScrollerItem key={turn.id}>
                      <div className="flex flex-col gap-5">
                        <UserMessage text={turn.input} />
                        <Message>
                          <MessageContent>
                            <article aria-label="Agent response" className="flex min-w-0 flex-col gap-3 leading-7">
                              {(turn.reply.running || turn.reply.progress || turn.reply.failed || turn.reply.data) && (
                                <A2AExecution
                                  progress={turn.reply.progress}
                                  data={turn.reply.data}
                                  status={
                                    turn.reply.running
                                      ? trackingError && turn === lastTurn
                                        ? 'Status unavailable'
                                        : 'Running'
                                      : turn.reply.failed
                                        ? 'Failed'
                                        : turn.reply.continuation
                                          ? 'Waiting for input'
                                          : 'Complete'
                                  }
                                />
                              )}
                              {turn === lastTurn && turn.reply.choices?.length ? (
                                <CompanyChoice
                                  prompt={turn.reply.text}
                                  options={turn.reply.choices.map(choice => ({ id: choice, label: choice }))}
                                  disabled={busy}
                                  onChoose={send}
                                />
                              ) : (
                                !turn.reply.running && <p className="whitespace-pre-wrap">{turn.reply.text}</p>
                              )}
                            </article>
                          </MessageContent>
                        </Message>
                      </div>
                    </MessageScrollerItem>
                  ))}
                  {sending && (
                    <MessageScrollerItem>
                      <div className="flex flex-col gap-5">
                        <UserMessage text={sending} />
                        <A2AExecution status="Running" />
                      </div>
                    </MessageScrollerItem>
                  )}
                  {(error || storageError || trackingError) && (
                    <MessageScrollerItem>
                      <Alert variant="destructive">
                        <AlertCircle />
                        <AlertDescription>
                          <p>{trackingError?.message ?? error ?? storageError}</p>
                          {trackingError?.retryable && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTrackingError(undefined)
                                setTrackingAttempt(attempt => attempt + 1)
                              }}
                            >
                              Check status again
                            </Button>
                          )}
                        </AlertDescription>
                      </Alert>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              {hasMessages && (
                <MessageScrollerButton aria-label="Scroll to bottom" className="rounded-full shadow-sm" size="icon" />
              )}
            </MessageScroller>
            {hasMessages && (
              <div className="shrink-0 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="mx-auto w-full max-w-5xl px-4 sm:px-8">{composer}</div>
              </div>
            )}
            <FollowLatest message={sending || undefined} />
          </MessageScrollerProvider>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
