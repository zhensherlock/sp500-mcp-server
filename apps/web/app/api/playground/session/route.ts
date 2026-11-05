import { NextResponse } from 'next/server'
import { modelContextWindow } from '@/lib/playground/model-context'
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
  const model = process.env.OPENAI_MODEL ?? 'gpt-6-luna'
  const response = NextResponse.json({
    configured: Boolean(process.env.OPENAI_API_KEY),
    model,
    engine: 'eve',
    contextWindow: modelContextWindow(model, process.env.OPENAI_CONTEXT_WINDOW),
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
