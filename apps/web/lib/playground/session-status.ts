import { session, type SessionView } from 'eve/events'

const unavailableCodes = new Set([
  'session_not_active',
  'session_expired',
  'session_stranded',
  'session_version_unsupported',
])

export function sessionUnavailable(view: SessionView, ...errors: unknown[]) {
  return (
    session(view).status === 'ended' ||
    errors.some(error => {
      if (!error || typeof error !== 'object' || !('code' in error)) return false
      return typeof error.code === 'string' && unavailableCodes.has(error.code)
    })
  )
}
