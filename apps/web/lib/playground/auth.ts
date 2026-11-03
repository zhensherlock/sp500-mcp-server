import { createHmac, timingSafeEqual } from 'node:crypto'

export const PLAYGROUND_COOKIE = 'sp500-playground'
const MAX_AGE = 60 * 60 * 24 * 7

function secret() {
  const value = process.env.PLAYGROUND_SESSION_SECRET ?? process.env.OPENAI_API_KEY
  if (value) return value
  if (process.env.NODE_ENV !== 'production') return 'sp500-playground-local-development'
  throw new Error('Configure OPENAI_API_KEY or PLAYGROUND_SESSION_SECRET on the server.')
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url')
}

export function createVisitorToken(id = crypto.randomUUID()) {
  const payload = Buffer.from(JSON.stringify({ id, expires: Date.now() + MAX_AGE * 1000 })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function sessionCookieName(sessionId: string) {
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(sessionId)) throw new Error('Invalid session ID.')
  return `sp500-eve-${sessionId}`
}

export function sessionProof(visitorId: string, sessionId: string) {
  return sign(`session:${visitorId}:${sessionId}`)
}

export function ownsSession(request: Request, sessionId: string) {
  const visitorId = visitorFromRequest(request)
  if (!visitorId) return false
  const prefix = `${sessionCookieName(sessionId)}=`
  const actual = request.headers
    .get('cookie')
    ?.split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(prefix))
    ?.slice(prefix.length)
  return actual === sessionProof(visitorId, sessionId)
}

export function proxyProof(visitorId: string, pathname: string) {
  return sign(`proxy:${visitorId}:${pathname}`)
}

export function isPlaygroundProxyRequest(request: Request, visitorId: string) {
  return request.headers.get('x-sp500-proxy') === proxyProof(visitorId, new URL(request.url).pathname)
}

export function visitorFromRequest(request: Request): string | null {
  const token = request.headers
    .get('cookie')
    ?.split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(`${PLAYGROUND_COOKIE}=`))
    ?.slice(PLAYGROUND_COOKIE.length + 1)
  if (!token) return null
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null
    const expected = Buffer.from(sign(payload))
    const actual = Buffer.from(signature)
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof value.id === 'string' && value.expires > Date.now() ? value.id : null
  } catch {
    return null
  }
}

export function requirePlaygroundRequest(request: Request) {
  if (!isSameOriginRequest(request)) throw new Error('Cross-origin requests are not allowed.')
  if (!visitorFromRequest(request)) throw new Error('Start a playground session first.')
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const url = new URL(request.url)
  if (origin === url.origin) return true
  // Next's rewrite reaches Eve on a loopback sidecar. Its forwarded host is
  // the browser-facing domain; hosted deployments use Vercel's trusted proxy.
  if (['127.0.0.1', 'localhost'].includes(url.hostname) || process.env.VERCEL) {
    const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
    const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? url.protocol.slice(0, -1)
    if (host && ['http', 'https'].includes(protocol)) return origin === `${protocol}://${host}`
  }
  return false
}

export const visitorCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
}
