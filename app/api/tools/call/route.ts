import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { toolName, params } = await request.json()

    if (!toolName) {
      return NextResponse.json({ error: 'toolName is required' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || `http://localhost:${process.env.PORT || 3000}`
    const mcpUrl = `${origin}/mcp`

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
    console.log('contentType', contentType)

    if (contentType.includes('text/event-stream')) {
      const text = await response.text()
      const lines = text.split('\n').filter(line => line.startsWith('data: '))
      const results = lines.map(line => JSON.parse(line.slice(6)))
      return NextResponse.json({ events: results })
    }
  } catch (error) {
    console.error('Error calling tool:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
