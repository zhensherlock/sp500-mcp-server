import { describe, expect, it } from 'vitest'
import type { SessionEvent, SessionStreamEvent } from 'eve/client'
import type { EveMessage, EveMessagePart } from 'eve/react'
import { messagesInEventOrder } from '../../lib/playground/message-order'

function event<T extends SessionEvent>(value: T, line: number, index = 0): T & { meta: SessionStreamEvent['meta'] } {
  return { ...value, meta: { position: { line, index }, at: '2026-11-03T05:00:00.000Z' } }
}

function assistant(parts: readonly EveMessagePart[]): EveMessage {
  return { id: 'turn_0:assistant', role: 'assistant', metadata: { turnId: 'turn_0' }, parts }
}

function tool(callId = 'news', state: 'running' | 'completed' | 'streaming' = 'completed'): EveMessagePart {
  const common = {
    type: 'tool' as const,
    callId,
    name: 'get_company_news',
    label: 'Company news',
    kind: 'tool' as const,
    stepIndex: 0,
  }
  return state === 'streaming' ? { ...common, state, inputText: '{' } : { ...common, state }
}

const thinking: EveMessagePart = {
  type: 'reasoning',
  id: 'run_0.0',
  stepIndex: 0,
  text: 'Checking sources.',
  state: 'done',
}
const firstDelta = event(
  { type: 'content.delta', data: { partId: 'run_0.0', kind: 'reasoning', delta: 'Checking' } },
  4,
)
const toolInput = event(
  { type: 'call.input', data: { callId: 'news', kind: 'tool', name: 'get_company_news', delta: '{' } },
  70,
)
const requested = event(
  {
    type: 'call.requested',
    data: { callId: 'news', owner: { runId: 'run_0' }, capability: { kind: 'tool', name: 'get_company_news' } },
  },
  79,
)
const completed = event(
  {
    type: 'content.completed',
    data: { partId: 'run_0.0', runId: 'run_0', kind: 'reasoning', value: 'Checking sources.', phase: 'narration' },
  },
  80,
)

describe('message event chronology', () => {
  it('keeps thinking before a tool from its first streamed input through completion', () => {
    for (const state of ['streaming', 'running', 'completed'] as const) {
      const message = assistant([tool('news', state), thinking])
      expect(
        messagesInEventOrder([message], [firstDelta, toolInput, requested, completed])[0].parts.map(part => part.type),
      ).toEqual(['reasoning', 'tool'])
      expect(message.parts[0].type).toBe('tool')
    }
  })

  it('keeps the same ordering after serializing and replaying the events', () => {
    const secondThinking: EveMessagePart = { ...thinking, id: 'run_1.0', stepIndex: 1 }
    const answer: EveMessagePart = {
      type: 'text',
      id: 'run_1.1',
      text: 'Here are the sources.',
      state: 'done',
      stepIndex: 1,
    }
    const events = [
      firstDelta,
      toolInput,
      requested,
      completed,
      event({ type: 'content.delta', data: { partId: 'run_1.0', kind: 'reasoning', delta: 'Reviewing' } }, 86),
      event({ type: 'content.delta', data: { partId: 'run_1.1', kind: 'text', delta: 'Here' } }, 165),
    ]
    const restored = JSON.parse(JSON.stringify(events)) as SessionStreamEvent[]
    const parts = messagesInEventOrder([assistant([tool(), thinking, secondThinking, answer])], restored)[0].parts
    expect(parts).toEqual([thinking, tool(), secondThinking, answer])
  })

  it('uses event order rather than prioritizing reasoning, text, or tool types', () => {
    const text: EveMessagePart = { type: 'text', id: 'intro', text: 'I will check.', state: 'done' }
    const events = [
      event({ type: 'content.delta', data: { partId: 'intro', kind: 'text', delta: 'I' } }, 1),
      toolInput,
      event({ type: 'content.delta', data: { partId: 'run_0.0', kind: 'reasoning', delta: 'Checking' } }, 100),
    ]
    expect(messagesInEventOrder([assistant([thinking, tool(), text])], events)[0].parts).toEqual([
      text,
      tool(),
      thinking,
    ])
  })

  it('does not reorder parallel tools when they finish in a different order', () => {
    const second = tool('second')
    const events = [
      toolInput,
      event({ type: 'call.input', data: { callId: 'second', delta: '{' } }, 71),
      event({ type: 'call.settled', data: { callId: 'second', outcome: 'completed' } }, 72),
      event({ type: 'call.settled', data: { callId: 'news', outcome: 'completed' } }, 73),
    ]
    expect(messagesInEventOrder([assistant([second, tool()])], events)[0].parts).toEqual([tool(), second])
  })

  it('uses source line and fact index, with the earliest position for each part', () => {
    const events = [completed, requested, firstDelta, toolInput]
    expect(messagesInEventOrder([assistant([tool(), thinking])], events)[0].parts).toEqual([thinking, tool()])
    const sameLine = [
      event({ type: 'content.completed', data: completed.data }, 10, 0),
      event({ type: 'call.requested', data: requested.data }, 10, 1),
    ]
    expect(messagesInEventOrder([assistant([tool(), thinking])], sameLine)[0].parts).toEqual([thinking, tool()])
  })

  it('leaves user messages and parts without matching events in place', () => {
    const user: EveMessage = { id: 'user', role: 'user', parts: [{ type: 'text', text: 'News?' }] }
    const imported: EveMessagePart = { type: 'text', text: 'Imported context.' }
    const result = messagesInEventOrder([user, assistant([tool(), imported, thinking])], [firstDelta, toolInput])
    expect(result[0]).toBe(user)
    expect(result[1].parts).toEqual([thinking, imported, tool()])
    const withoutEvents = assistant([thinking, tool()])
    expect(messagesInEventOrder([withoutEvents], [])[0].parts).toEqual(withoutEvents.parts)
  })
})
