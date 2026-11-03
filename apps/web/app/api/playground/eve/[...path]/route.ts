import { NextResponse } from 'next/server'
import {
  ownsSession,
  proxyProof,
  requirePlaygroundRequest,
  sessionCookieName,
  sessionProof,
  visitorCookieOptions,
  visitorFromRequest,
} from '@/lib/playground/auth'

export const maxDuration = 300

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    requirePlaygroundRequest(request)
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { path } = await context.params
  const [version, resource, sessionId, action] = path
  const create = version === 'v1' && resource === 'session' && path.length === 2 && request.method === 'POST'
  const session =
    version === 'v1' &&
    resource === 'session' &&
    sessionId &&
    path.length <= 4 &&
    (!action || ['stream', 'cancel', 'end', 'clear', 'compact'].includes(action))
  if (!create && !session) return Response.json({ error: 'Unknown endpoint.' }, { status: 404 })
  try {
    if (sessionId && !ownsSession(request, sessionId))
      return Response.json({ error: 'This session belongs to another visitor.' }, { status: 403 })
  } catch {
    return Response.json({ error: 'Invalid session.' }, { status: 400 })
  }

  const visitorId = visitorFromRequest(request)!
  const target = new URL(`/eve/${path.join('/')}`, request.url)
  target.search = new URL(request.url).search
  const headers = new Headers({
    cookie: request.headers.get('cookie')!,
    'x-sp500-proxy': proxyProof(visitorId, target.pathname),
  })
  if (request.headers.has('content-type')) headers.set('content-type', request.headers.get('content-type')!)
  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET)
    headers.set('x-vercel-protection-bypass', process.env.VERCEL_AUTOMATION_BYPASS_SECRET)
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'POST' ? await request.text() : undefined,
      signal: request.signal,
      cache: 'no-store',
      redirect: 'error',
    })
    const responseHeaders = new Headers({ 'Cache-Control': 'private, no-store' })
    upstream.headers.forEach((value, key) => {
      if (key === 'content-type' || key === 'retry-after' || key.startsWith('x-eve-')) responseHeaders.set(key, value)
    })
    if (create && upstream.ok) {
      const body = await upstream.json()
      const response = NextResponse.json(body, { status: upstream.status, headers: responseHeaders })
      if (typeof body.sessionId !== 'string') throw new Error('Missing session ID.')
      response.cookies.set(sessionCookieName(body.sessionId), sessionProof(visitorId, body.sessionId), {
        ...visitorCookieOptions,
        path: '/api/playground/eve',
      })
      return response
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 })
    console.error('Playground Eve proxy failed:', error)
    return Response.json({ error: 'The agent connection failed. Please reconnect.' }, { status: 502 })
  }
}

export { proxy as GET, proxy as POST }
