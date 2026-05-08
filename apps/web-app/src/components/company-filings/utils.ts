import type { CompanyFilingsResult } from './types'
import { parseToolResult } from '@/components/tool-app/parse-tool-result'

export function parseCompanyFilingsFromToolResult(result: unknown): CompanyFilingsResult {
  return parseToolResult<CompanyFilingsResult>(result)
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
