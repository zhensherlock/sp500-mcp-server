import { afterEach, describe, expect, it, vi } from 'vitest'
import { callMcpTool, parseRpcResponse } from '../../lib/mcp-apps/protocol'
import { companyChoice } from '../../lib/mcp-apps/contracts'
import {
  createVisitorToken,
  isSameOriginRequest,
  visitorFromRequest,
  ownsSession,
  sessionProof,
  sessionCookieName,
  proxyProof,
  isPlaygroundProxyRequest,
} from '../../lib/playground/auth'

afterEach(() => vi.unstubAllGlobals())

describe('stateless MCP adapter', () => {
  it('reads JSON and SSE responses and propagates protocol errors', () => {
    expect(parseRpcResponse('data: {"jsonrpc":"2.0","id":1,"result":{"content":[]}}\n\n', 'text/event-stream')).toEqual(
      { content: [] },
    )
    expect(() => parseRpcResponse('{"error":{"message":"No such tool"}}', 'application/json')).toThrow('No such tool')
  })
  it('sends the required routing headers and persists selection continuation', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(Response.json({ jsonrpc: '2.0', id: 1, result: { content: [], resultType: 'complete' } }))
    vi.stubGlobal('fetch', fetch)
    await callMcpTool(
      'get_company_info',
      { query: 'Bank' },
      { requestState: 'opaque', inputResponses: { company: { action: 'accept', content: { companyName: 'BAC' } } } },
    )
    const init = fetch.mock.calls[0][1]
    expect(init.headers).toMatchObject({
      'MCP-Protocol-Version': '2026-07-28',
      'Mcp-Method': 'tools/call',
      'Mcp-Name': 'get_company_info',
    })
    expect(JSON.parse(init.body).params).toMatchObject({
      requestState: 'opaque',
      inputResponses: { company: { content: { companyName: 'BAC' } } },
      _meta: { 'io.modelcontextprotocol/clientCapabilities': { elicitation: { form: {} } } },
    })
  })
  it('uses the server enum as the company selection value', () => {
    expect(
      companyChoice({
        method: 'elicitation/create',
        params: { message: 'Choose', requestedSchema: { properties: { companyName: { enum: ['BAC', 'BK'] } } } },
      }),
    ).toEqual({ field: 'companyName', options: ['BAC', 'BK'] })
  })
})

describe('visitor isolation', () => {
  it('accepts signed cookies and rejects tampered ones', () => {
    const token = createVisitorToken('visitor-one')
    expect(
      visitorFromRequest(new Request('http://localhost', { headers: { cookie: `sp500-playground=${token}` } })),
    ).toBe('visitor-one')
    expect(
      visitorFromRequest(new Request('http://localhost', { headers: { cookie: `sp500-playground=${token}changed` } })),
    ).toBeNull()
  })
  it('recognizes the Next proxy and rejects foreign browser origins', () => {
    const headers = {
      origin: 'http://localhost:3001',
      'x-forwarded-host': 'localhost:3001',
      'x-forwarded-proto': 'http',
    }
    expect(isSameOriginRequest(new Request('http://127.0.0.1:5000/eve/v1/session', { headers }))).toBe(true)
    expect(
      isSameOriginRequest(
        new Request('http://127.0.0.1:5000/eve/v1/session', {
          headers: { ...headers, origin: 'https://elsewhere.example' },
        }),
      ),
    ).toBe(false)
  })
  it('binds a session capability to its visitor and requires a signed proxy request', () => {
    const owner = createVisitorToken('owner')
    const sessionId = 'wrun_test'
    const capability = `${sessionCookieName(sessionId)}=${sessionProof('owner', sessionId)}`
    expect(
      ownsSession(
        new Request('http://localhost', { headers: { cookie: `sp500-playground=${owner}; ${capability}` } }),
        sessionId,
      ),
    ).toBe(true)
    expect(
      ownsSession(
        new Request('http://localhost', {
          headers: { cookie: `sp500-playground=${createVisitorToken('other')}; ${capability}` },
        }),
        sessionId,
      ),
    ).toBe(false)
    expect(
      isPlaygroundProxyRequest(
        new Request('http://localhost/eve/v1/session', {
          headers: { 'x-sp500-proxy': proxyProof('owner', '/eve/v1/session') },
        }),
        'owner',
      ),
    ).toBe(true)
    expect(isPlaygroundProxyRequest(new Request('http://localhost/eve/v1/session'), 'owner')).toBe(false)
  })
})
