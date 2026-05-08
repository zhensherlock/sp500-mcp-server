import { NextRequest, NextResponse } from 'next/server'

const LOGO_DEV_IMAGE_ORIGIN = 'https://img.logo.dev'

type LogoRouteContext = {
  params: Promise<{
    path?: string[]
  }>
}

const PASSTHROUGH_RESPONSE_HEADERS = ['cache-control', 'content-type', 'etag', 'last-modified']

export async function GET(request: NextRequest, context: LogoRouteContext) {
  const token = process.env.LOGO_DEV_TOKEN

  if (!token) {
    return NextResponse.json({ error: 'LOGO_DEV_TOKEN is not configured' }, { status: 500 })
  }

  const { path = [] } = await context.params

  if (path.length === 0) {
    return NextResponse.json({ error: 'Logo path is required' }, { status: 400 })
  }

  const upstreamUrl = new URL(path.map(encodeURIComponent).join('/'), `${LOGO_DEV_IMAGE_ORIGIN}/`)

  request.nextUrl.searchParams.forEach((value, key) => {
    if (key.toLowerCase() !== 'token') {
      upstreamUrl.searchParams.append(key, value)
    }
  })

  upstreamUrl.searchParams.set('token', token)

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        Accept: request.headers.get('accept') ?? 'image/avif,image/webp,image/png,image/jpeg,*/*',
      },
    })

    const headers = new Headers()

    for (const headerName of PASSTHROUGH_RESPONSE_HEADERS) {
      const headerValue = upstreamResponse.headers.get(headerName)

      if (headerValue) {
        headers.set(headerName, headerValue)
      }
    }

    headers.set('vary', 'Accept')

    return new Response(upstreamResponse.body, {
      headers,
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    })
  } catch (error) {
    console.error('Error proxying Logo.dev image:', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy Logo.dev image' },
      { status: 502 },
    )
  }
}
