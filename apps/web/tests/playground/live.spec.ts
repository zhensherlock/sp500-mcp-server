import { beforeAll, describe, expect, it } from 'vitest'
import { companyTools, type CompanyToolName } from '../../lib/mcp-apps/contracts'

const origin = process.env.PLAYGROUND_TEST_URL
describe.skipIf(!origin)('live playground MCP bridge', () => {
  let cookie: string
  beforeAll(async () => {
    const response = await fetch(`${origin}/api/playground/session`, { method: 'POST' })
    expect(response.status).toBe(200)
    cookie = response.headers.get('set-cookie')!.split(';')[0]
  })
  async function call(name: CompanyToolName, args: Record<string, unknown>, continuation?: unknown) {
    const response = await fetch(`${origin}/api/playground/tool`, {
      method: 'POST',
      headers: { cookie, origin: origin!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, arguments: args, continuation }),
    })
    expect(response.status).toBe(200)
    return response.json()
  }
  it.each(Object.keys(companyTools) as CompanyToolName[])('calls %s and reads its actual HTML app', async name => {
    const result = await call(name, { query: 'AAPL', ...(name === 'get_company_info' ? {} : { limit: 2 }) })
    expect(result.status).toBe('completed')
    expect(result.result.isError).not.toBe(true)
    expect(result.result.content.length).toBeGreaterThan(0)
    const resource = await fetch(
      `${origin}/api/playground/resource?uri=${encodeURIComponent(`ui://sp500/${companyTools[name].page}.html`)}`,
      { headers: { cookie } },
    )
    expect(resource.status).toBe(200)
    const app = await resource.json()
    expect(app.html).toContain('<html')
    expect(app.mimeType).toBe('text/html;profile=mcp-app')
  })
  it('waits for a company choice, then resumes with the selected symbol', async () => {
    const response = await call('get_company_info', { query: 'Bank' })
    expect(response.status).toBe('input_required')
    const resumed = await call(
      'get_company_info',
      { query: 'Bank' },
      {
        requestState: response.pending.requestState,
        inputResponses: { company: { action: 'accept', content: { companyName: 'BAC' } } },
      },
    )
    expect(resumed.status).toBe('completed')
    expect(resumed.result.structuredContent.symbol).toBe('BAC')
  })
  it('rejects anonymous tool calls and non-allowlisted resources', async () => {
    expect((await fetch(`${origin}/api/playground/tool`, { method: 'POST', body: '{}' })).status).toBe(401)
    expect(
      (await fetch(`${origin}/api/playground/resource?uri=file:///etc/passwd`, { headers: { cookie } })).status,
    ).toBe(400)
  })
  it('isolates Eve sessions between visitors through the Next rewrite', async () => {
    const created = await fetch(`${origin}/api/playground/eve/v1/session`, {
      method: 'POST',
      headers: { cookie, origin: origin!, 'Content-Type': 'application/json' },
      body: '{}',
    })
    expect(created.status).toBe(202)
    const { sessionId } = await created.json()
    const ownerCookie = `${cookie}; ${created.headers.get('set-cookie')!.split(';')[0]}`
    const stream = await fetch(
      `${origin}/api/playground/eve/v1/session/${sessionId}/stream?follow=false&includeTailIndex=1`,
      { headers: { cookie: ownerCookie } },
    )
    expect(stream.status).toBe(200)
    expect(stream.headers.get('x-eve-stream-version')).toBeTruthy()
    await stream.text()
    const other = await fetch(`${origin}/api/playground/session`, { method: 'POST' })
    const otherCookie = other.headers.get('set-cookie')!.split(';')[0]
    const access = await fetch(`${origin}/api/playground/eve/v1/session/${sessionId}`, {
      method: 'POST',
      headers: { cookie: otherCookie, 'Content-Type': 'application/json' },
      body: '{}',
    })
    expect([401, 403, 404]).toContain(access.status)
    const closed = await fetch(`${origin}/api/playground/eve/v1/session/${sessionId}/end`, {
      method: 'POST',
      headers: { cookie: ownerCookie, 'Content-Type': 'application/json' },
      body: '{}',
    })
    expect(closed.ok).toBe(true)
  })
})
