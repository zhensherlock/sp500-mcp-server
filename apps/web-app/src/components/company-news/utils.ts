import type { CompanyNewsResult, NewsSentiment } from './types'
import { parseToolResult } from '@/components/tool-app/parse-tool-result'

export function parseCompanyNewsFromToolResult(result: unknown): CompanyNewsResult {
  return parseToolResult<CompanyNewsResult>(result)
}

export function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getSentimentClass(sentiment: NewsSentiment) {
  switch (sentiment) {
    case 'positive':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'negative':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-neutral-200 bg-neutral-100 text-neutral-600'
  }
}
