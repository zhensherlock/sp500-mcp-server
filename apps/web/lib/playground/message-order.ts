import type { SessionStreamEvent } from 'eve/client'
import type { EveMessage, EveMessagePart } from 'eve/react'

type Position = SessionStreamEvent['meta']['position']

function comparePosition(left: Position, right: Position) {
  return left.line - right.line || left.index - right.index
}

function partKey(part: EveMessagePart) {
  if (part.type === 'text' || part.type === 'reasoning') return part.id ? `content:${part.id}` : undefined
  if (part.type === 'tool') return `call:${part.callId}`
  if (part.type === 'interaction') return `interaction:${part.interactionId}`
}

export function messagesInEventOrder(
  messages: readonly EveMessage[],
  events: readonly SessionStreamEvent[],
): EveMessage[] {
  const firstAppearance = new Map<string, Position>()
  for (const event of events) {
    let key: string | undefined
    switch (event.type) {
      case 'content.delta':
      case 'content.completed':
        key = `content:${event.data.partId}`
        break
      case 'call.input':
      case 'call.requested':
      case 'call.started':
      case 'call.progress':
      case 'call.settled':
        key = `call:${event.data.callId}`
        break
      case 'interaction.opened':
      case 'interaction.settled':
        key = `interaction:${event.data.interactionId}`
        break
    }
    if (!key) continue
    const previous = firstAppearance.get(key)
    if (!previous || comparePosition(event.meta.position, previous) < 0) firstAppearance.set(key, event.meta.position)
  }

  return messages.map(message => {
    if (message.role !== 'assistant') return message
    // Eve places completed parts by their completion fact and streaming parts
    // last. Keep the first delta/input position instead, including on replay.
    const placed = message.parts
      .flatMap(part => {
        const key = partKey(part)
        const position = key ? firstAppearance.get(key) : undefined
        return position ? [{ part, position }] : []
      })
      .sort((left, right) => comparePosition(left.position, right.position))
    let index = 0
    const parts = message.parts.map(part => {
      const key = partKey(part)
      // Imported/unknown parts without events retain their existing slots.
      return key && firstAppearance.has(key) ? placed[index++].part : part
    })
    return { ...message, parts }
  })
}
