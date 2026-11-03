import { NextResponse } from 'next/server'
import {
  createVisitorToken,
  isSameOriginRequest,
  PLAYGROUND_COOKIE,
  visitorCookieOptions,
  visitorFromRequest,
} from '@/lib/playground/auth'

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  const response = NextResponse.json({
    configured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL ?? 'gpt-6-luna',
    engine: 'eve',
  })
  response.headers.set('Cache-Control', 'no-store')
  if (!visitorFromRequest(request)) {
    try {
      response.cookies.set(PLAYGROUND_COOKIE, createVisitorToken(), visitorCookieOptions)
    } catch {
      return NextResponse.json({ error: 'The playground is not configured on this server.' }, { status: 503 })
    }
  }
  return response
}
