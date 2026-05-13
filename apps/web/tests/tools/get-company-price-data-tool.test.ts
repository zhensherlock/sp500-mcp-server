import { get } from 'lodash-es'
import { describe, expect, test } from 'vitest'

describe('get-company-price-data-tool.ts', () => {
  test('get company price data', async () => {
    const res = await global.client.callTool({
      name: 'get_company_price_data',
      arguments: {
        query: 'AAPL',
        start_date: '2026-04-29',
        end_date: '2026-04-30',
        limit: 5,
      },
    })
    const text = get(res, 'content[0].text', '') as string

    expect(text).toContain('AAPL')
    expect(text).toContain('prices')
    expect(text).toContain('trade_date')
  })
})
