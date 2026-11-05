import { describe, expect, it } from 'vitest'
import { emptySessionView, foldEvents } from 'eve/events'
import { sessionUnavailable } from '../../lib/playground/session-status'

describe('session availability', () => {
  it('leaves new and live sessions usable, including a temporarily not-ready session', () => {
    const view = emptySessionView()
    expect(sessionUnavailable(view)).toBe(false)
    expect(sessionUnavailable(view, new Error('Connection reset'))).toBe(false)
    expect(sessionUnavailable(view, { code: 'session_not_ready' })).toBe(false)
    expect(sessionUnavailable(view, { code: 'unauthorized' })).toBe(false)
  })

  it('recognizes terminal server errors even when cached history still looks live', () => {
    for (const code of ['session_not_active', 'session_expired', 'session_stranded', 'session_version_unsupported']) {
      const error = Object.assign(new Error('Unavailable'), { code })
      expect(sessionUnavailable(emptySessionView(), undefined, error)).toBe(true)
    }
  })

  it('recognizes an ended stream without requiring an HTTP failure', () => {
    const view = foldEvents(emptySessionView(), [
      { type: 'session.started', data: {}, meta: { position: { line: 0, index: 0 }, at: '2026-11-04T09:00:00Z' } },
      {
        type: 'session.ended',
        data: { outcome: 'completed' },
        meta: { position: { line: 1, index: 0 }, at: '2026-11-04T09:30:00Z' },
      },
    ])
    expect(sessionUnavailable(view)).toBe(true)
  })
})
