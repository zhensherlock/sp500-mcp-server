import { parseToolResult } from '@/components/tool-app/parse-tool-result'
import type { CompanyPriceDataResult } from './types'

export function parseCompanyPriceDataFromToolResult(result: unknown): CompanyPriceDataResult {
  return parseToolResult<CompanyPriceDataResult>(result)
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatVolume(value: number) {
  return new Intl.NumberFormat('en', {
    maximumFractionDigits: 1,
    notation: 'compact',
  }).format(value)
}

export function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date)
}
