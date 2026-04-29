import { get } from 'lodash-es'
import { describe, expect, test } from 'vitest'

describe('get-company-filings-tool.ts', () => {
  test('get company filings', async () => {
    const res = await global.client.callTool({
      name: 'get_company_filings',
      arguments: {
        query: 'apple',
      },
    })
    const text = get(res, 'content[0].text', '') as string
    expect(text).toContain('AAPL')
  })
})
