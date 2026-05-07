import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { toolName, params } = await request.json()

    if (!toolName) {
      return NextResponse.json({ error: 'toolName is required' }, { status: 400 })
    }

    const mcpUrl = new URL('/mcp', request.nextUrl.origin)

    const response = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params || {},
        },
        jsonrpc: '2.0',
        id: 1,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: `Streamable HTTP error: ${text}` }, { status: 500 })
    }

    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('text/event-stream')) {
      const text = await response.text()
      const events = text
        .split('\n')
        .filter(line => line.startsWith('data: '))
        .map(line => JSON.parse(line.slice(6)))
      const result = events.findLast(event => event && typeof event === 'object' && 'result' in event)?.result

      return NextResponse.json(result ? { ...result, events } : { events })
    }

    const data = await response.json()
    return NextResponse.json(data.result ?? data)
  } catch (error) {
    console.error('Error calling tool:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
