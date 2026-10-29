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
      return 'border-positive/25 bg-positive/10 text-positive'
    case 'negative':
      return 'border-negative/25 bg-negative/10 text-negative'
    default:
      return 'border-border bg-secondary text-muted-foreground'
  }
}
