import { get } from 'lodash-es'
import { describe, expect, test } from 'vitest'

describe('get-company-news-tool.ts', () => {
  test('get company news', async () => {
    const res = await global.client.callTool({
      name: 'get_company_news',
      arguments: {
        query: 'apple',
      },
    })
    const text = get(res, 'content[0].text', '') as string
    expect(text).toContain('AAPL')
  })
})
