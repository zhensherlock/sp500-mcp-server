import { parseToolResult } from '@/components/tool-app/parse-tool-result'
import type { CompanyPriceDataArguments, CompanyPriceDataResult, CompanyPriceRange } from './types'

export function getPriceRangeArguments(
  symbol: string,
  range: CompanyPriceRange,
  now = new Date(),
): CompanyPriceDataArguments {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - (range === 'month' ? 1 : 12), 1))
  const lastDayOfMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate()
  start.setUTCDate(Math.min(end.getUTCDate(), lastDayOfMonth))

  return {
    query: symbol,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
    limit: 1000,
  }
}

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
