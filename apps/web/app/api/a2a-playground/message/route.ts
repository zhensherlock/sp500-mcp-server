import { timingSafeEqual } from 'node:crypto'
import { Message, TaskState, type Part } from '@a2a-js/sdk'
import { ClientFactory, ClientFactoryOptions, DefaultAgentCardResolver } from '@a2a-js/sdk/client'
import { TaskNotFoundError } from '@a2a-js/sdk/errors'
import { NextResponse } from 'next/server'
import { a2aMessageSchema, a2aProgressSchema, type A2AReply } from '@/lib/a2a-playground/contracts'
import {
  createVisitorToken,
  isSameOriginRequest,
  PLAYGROUND_COOKIE,
  sessionProof,
  visitorCookieOptions,
  visitorFromRequest,
} from '@/lib/playground/auth'

function continuationProof(visitor: string, taskId: string, contextId: string) {
  return sessionProof(visitor, `a2a:${taskId}:${contextId}`)
}

function textOf(parts: Part[]) {
  return parts.flatMap(({ content }) => (content?.$case === 'text' ? [content.value] : [])).join('\n\n')
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })

  const parsed = a2aMessageSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter a company name or ticker.' }, { status: 400 })

  const agentUrl = process.env.SP500_A2A_URL || (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:4100' : '')
  if (!agentUrl) return NextResponse.json({ error: 'Set SP500_A2A_URL to connect an A2A agent.' }, { status: 503 })

  const { continuation } = parsed.data
  const existingVisitor = visitorFromRequest(request)
  const visitor = existingVisitor ?? crypto.randomUUID()
  if (continuation) {
    const { taskId, contextId, proof } = continuation
    if (
      !existingVisitor ||
      !timingSafeEqual(Buffer.from(proof), Buffer.from(continuationProof(visitor, taskId, contextId)))
    ) {
      return NextResponse.json({ error: 'This A2A session has expired. Start a new brief.' }, { status: 409 })
    }
  }

  try {
    const visitorToken = existingVisitor ? undefined : createVisitorToken(visitor)
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(10_000)])
    const factory = new ClientFactory(
      ClientFactoryOptions.createFrom(ClientFactoryOptions.default, {
        cardResolver: new DefaultAgentCardResolver({
          fetchImpl: (input, init) => fetch(input, { ...init, signal, cache: 'no-store' }),
        }),
      }),
    )
    const client = await factory.createFromUrl(agentUrl)
    const task =
      'text' in parsed.data
        ? await client.sendMessage(
            {
              message: Message.fromJSON({
                messageId: crypto.randomUUID(),
                role: 'ROLE_USER',
                parts: [{ text: parsed.data.text }],
                taskId: continuation?.taskId,
                contextId: continuation?.contextId,
              }),
              tenant: '',
              configuration: {
                returnImmediately: true,
                historyLength: 0,
                acceptedOutputModes: [],
                taskPushNotificationConfig: undefined,
              },
              metadata: undefined,
            },
            { signal },
          )
        : await client.getTask({ id: parsed.data.continuation.taskId, tenant: '', historyLength: 0 }, { signal })
    if (!('id' in task) || !task.status) throw new Error('Expected a company brief task.')
    if (continuation && (task.id !== continuation.taskId || task.contextId !== continuation.contextId)) {
      throw new Error('The agent returned a different task.')
    }

    const statusParts = task.status.message?.parts ?? []
    const statusText = textOf(statusParts)
    const statusData = statusParts.find(part => part.content?.$case === 'data')?.content
    const data = statusData?.$case === 'data' ? statusData.value : undefined
    const progress = a2aProgressSchema.safeParse(data?.progress).data
    const reference = {
      taskId: task.id,
      contextId: task.contextId,
      proof: continuationProof(visitor, task.id, task.contextId),
    }
    let reply: A2AReply
    if (task.status.state === TaskState.TASK_STATE_SUBMITTED || task.status.state === TaskState.TASK_STATE_WORKING) {
      reply = { text: statusText, running: true, progress, continuation: reference }
    } else if (task.status.state === TaskState.TASK_STATE_INPUT_REQUIRED) {
      const choices = data?.options
      reply = {
        text: statusText || 'Enter a company name or ticker to continue.',
        choices: Array.isArray(choices)
          ? choices.filter((choice): choice is string => typeof choice === 'string')
          : undefined,
        progress,
        continuation: reference,
      }
    } else if (task.status.state === TaskState.TASK_STATE_COMPLETED) {
      const parts = task.artifacts.flatMap(artifact => artifact.parts)
      const artifactData = parts.find(part => part.content?.$case === 'data')?.content
      reply = {
        text: textOf(parts) || statusText,
        data: artifactData?.$case === 'data' ? artifactData.value : undefined,
        progress,
      }
    } else {
      reply = { text: 'The A2A task could not be completed. Send the company again to retry.', failed: true, progress }
    }

    const response = NextResponse.json(reply, { headers: { 'Cache-Control': 'no-store' } })
    if (visitorToken) response.cookies.set(PLAYGROUND_COOKIE, visitorToken, visitorCookieOptions)
    return response
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return NextResponse.json({ error: 'The agent no longer has this task. Start a new brief.' }, { status: 409 })
    }
    console.error('A2A Playground request failed:', error)
    return NextResponse.json(
      { error: 'Could not reach the A2A agent. Check that it is running and retry.' },
      { status: 502 },
    )
  }
}
