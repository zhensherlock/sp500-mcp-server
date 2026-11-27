import { get } from 'lodash-es'
import { describe, expect, test } from 'vitest'

describe('get-company-info-tool.ts', () => {
  test('get company info', async () => {
    const res = await global.client.callTool({
      name: 'get_company_info',
      arguments: {
        query: 'apple',
      },
    })
    const text = get(res, 'content[0].text', '') as string
    expect(text).toContain('AAPL')
  })

  test('prefers an exact ticker over partial matches', async () => {
    const res = await global.client.callTool({ name: 'get_company_info', arguments: { query: ' a ' } })
    expect(res.structuredContent).toMatchObject({ symbol: 'A' })
  })

  test('identifies a missing company with its own error code', async () => {
    const res = await global.client.callTool({ name: 'get_company_info', arguments: { query: 'Aple' } })
    expect(res.isError).toBe(true)
    expect(res._meta).toHaveProperty(['sp500/companyLookupError'], 'not_found')
  })
})
