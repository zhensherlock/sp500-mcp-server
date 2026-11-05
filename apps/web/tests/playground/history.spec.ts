import { describe, expect, it } from 'vitest'
import type { SessionStreamEvent } from 'eve/client'
import { saveConversation, sessionPosition, type SavedSession } from '../../lib/playground/history'

function content(line: number): SessionStreamEvent {
  return {
    type: 'content.delta',
    data: { partId: 'answer', kind: 'text', delta: 'Hello' },
    meta: { position: { line, index: 0 }, at: '2026-11-04T05:00:00.000Z' },
  }
}

function conversation(id: string, line: number, updated: number): SavedSession {
  return {
    id,
    title: id,
    updated,
    session: { sessionId: id, streamIndex: line + 1 } as SavedSession['session'],
    events: [content(line)],
  }
}

describe('conversation history', () => {
  it('keeps order and activity time when a saved conversation is restored', () => {
    const newest = conversation('newest', 10, 200)
    const older = conversation('older', 2, 100)
    const restored = JSON.parse(JSON.stringify({ ...older, updated: 999 })) as SavedSession
    const result = saveConversation([newest, older], restored)
    expect(result.map(item => item.id)).toEqual(['newest', 'older'])
    expect(result[1].updated).toBe(100)
  })

  it('persists a newer cursor without moving the conversation or changing its activity time', () => {
    const newest = conversation('newest', 10, 200)
    const older = conversation('older', 2, 100)
    const incoming = { ...older, session: { ...older.session, streamIndex: 50 }, updated: 999 }
    const result = saveConversation([newest, older], incoming)
    expect(result.map(item => item.id)).toEqual(['newest', 'older'])
    expect(result[1].session.streamIndex).toBe(50)
    expect(result[1].updated).toBe(100)
    expect(sessionPosition(incoming)).not.toBe(sessionPosition(older))
  })

  it('moves a conversation to the top when new output arrives', () => {
    const newest = conversation('newest', 10, 200)
    const older = conversation('older', 2, 100)
    const incoming = { ...older, events: [...older.events, content(40)], updated: 300 }
    const result = saveConversation([newest, older], incoming)
    expect(result.map(item => item.id)).toEqual(['older', 'newest'])
    expect(result[0].updated).toBe(300)
    expect(older.events).toHaveLength(1)
  })

  it('updates cached titles in place and keeps only the twelve most recent conversations', () => {
    const items = Array.from({ length: 12 }, (_, index) => conversation(String(index), index, 100 - index))
    const renamed = { ...items[5], title: 'Full question', updated: 999 }
    const sameOrder = saveConversation(items, renamed)
    expect(sameOrder[5].title).toBe('Full question')
    expect(sameOrder[5].updated).toBe(items[5].updated)
    const result = saveConversation(sameOrder, conversation('new', 20, 200))
    expect(result).toHaveLength(12)
    expect(result[0].id).toBe('new')
    expect(result.some(item => item.id === '11')).toBe(false)
  })
})
