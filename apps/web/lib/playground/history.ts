import type { UseEveAgentSnapshot } from 'eve/react'

export type SavedSession = {
  id: string
  title: string
  updated: number
  session: NonNullable<UseEveAgentSnapshot['session']>
  events: UseEveAgentSnapshot['events']
}

export function sessionPosition(item?: Pick<SavedSession, 'session' | 'events' | 'title'>) {
  return item ? `${item.session.sessionId}:${item.session.streamIndex}:${item.events.length}:${item.title}` : ''
}

function lastActivity(item: SavedSession) {
  // Reconnecting can advance the cursor without adding conversation content.
  // Only user input, visible output, or execution progress counts as activity.
  return item.events.findLast(event => /^(delivery\.admitted|content\.|call\.|interaction\.|turn\.)/.test(event.type))
}

export function saveConversation(items: SavedSession[], incoming: SavedSession): SavedSession[] {
  const index = items.findIndex(item => item.id === incoming.id)
  if (index < 0) return [incoming, ...items].slice(0, 12)
  const previous = items[index]
  const before = lastActivity(previous)?.meta.position
  const after = lastActivity(incoming)?.meta.position
  const changed = before?.line !== after?.line || before?.index !== after?.index
  const updated = changed ? incoming.updated : previous.updated
  const next = { ...incoming, updated }
  if (changed) return [next, ...items.filter(item => item.id !== incoming.id)].slice(0, 12)
  return items.map((item, position) => (position === index ? next : item))
}
