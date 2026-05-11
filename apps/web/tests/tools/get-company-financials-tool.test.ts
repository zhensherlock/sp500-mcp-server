import { get } from 'lodash-es'
import { describe, expect, test } from 'vitest'

describe('get-company-financials-tool.ts', () => {
  test('get company financials', async () => {
    const res = await global.client.callTool({
      name: 'get_company_financials',
      arguments: {
        query: 'apple',
        items: ['Total Revenue', 'Net Income', 'Diluted EPS'],
      },
    })
    const text = get(res, 'content[0].text', '') as string

    expect(text).toContain('AAPL')
    expect(text).toContain('Total Revenue')
  })
})
