import type { CompanyNewsResult, NewsSentiment } from './types'

export function parseCompanyNewsFromToolResult(result: unknown): CompanyNewsResult {
  if (!result || typeof result !== 'object') {
    throw new Error('Tool result is empty.')
  }

  const structuredContent = 'structuredContent' in result ? result.structuredContent : undefined
  if (structuredContent && typeof structuredContent === 'object') {
    return structuredContent as CompanyNewsResult
  }

  const content = 'content' in result ? result.content : undefined
  if (!Array.isArray(content)) {
    throw new Error('Tool result has no content blocks.')
  }

  const textBlock = content.find(
    block =>
      block &&
      typeof block === 'object' &&
      'type' in block &&
      block.type === 'text' &&
      'text' in block &&
      typeof block.text === 'string',
  )

  if (!textBlock || !('text' in textBlock) || typeof textBlock.text !== 'string') {
    throw new Error('Tool result has no text content.')
  }

  return JSON.parse(textBlock.text) as CompanyNewsResult
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
