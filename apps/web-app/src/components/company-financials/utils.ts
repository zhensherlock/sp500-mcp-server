import { parseToolResult } from '@/components/tool-app/parse-tool-result'
import type { CompanyFinancialsResult, FinancialMetric, FinancialUnit } from './types'

export const categoryOrder = [
  'Revenue',
  'Profitability',
  'Expenses',
  'EPS & Shares',
  'Interest',
  'Tax',
  'Unusual Items',
  'Industry Specific',
  'Other',
] as const

const compactNumberFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
  notation: 'compact',
})

const currencyFormatter = new Intl.NumberFormat('en', {
  currency: 'USD',
  maximumFractionDigits: 1,
  notation: 'compact',
  style: 'currency',
})

const preciseNumberFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

export function parseCompanyFinancialsFromToolResult(result: unknown): CompanyFinancialsResult {
  return parseToolResult<CompanyFinancialsResult>(result)
}

export function formatPeriod(value: string) {
  const date = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date)
}

export function formatMetricValue(value: number | undefined, unit: FinancialUnit) {
  if (value === undefined || !Number.isFinite(value)) {
    return '—'
  }

  if (unit === 'currency') {
    return currencyFormatter.format(value)
  }

  if (unit === 'per_share') {
    return preciseNumberFormatter.format(value)
  }

  if (unit === 'shares') {
    return compactNumberFormatter.format(value)
  }

  if (unit === 'ratio') {
    return `${(value * 100).toFixed(1)}%`
  }

  return compactNumberFormatter.format(value)
}

export function formatDelta(metric: Pick<FinancialMetric, 'change' | 'changePercent' | 'unit'>) {
  if (metric.unit === 'ratio' && metric.change !== undefined) {
    const value = metric.change * 100
    const sign = value > 0 ? '+' : ''

    return `${sign}${value.toFixed(1)} pp`
  }

  if (metric.changePercent === undefined || !Number.isFinite(metric.changePercent)) {
    return '—'
  }

  const value = metric.changePercent * 100
  const sign = value > 0 ? '+' : ''

  return `${sign}${value.toFixed(1)}%`
}

export function getDeltaTone(change?: number) {
  if (change === undefined || change === 0) {
    return 'neutral'
  }

  return change > 0 ? 'positive' : 'negative'
}

export function getMetricKey(item: string) {
  return item
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function getMetricsForItems(metrics: FinancialMetric[], items: string[]) {
  const byItem = new Map(metrics.map(metric => [metric.item, metric]))

  return items.flatMap(item => {
    const metric = byItem.get(item)

    return metric ? [metric] : []
  })
}

export function sortMetrics(metrics: FinancialMetric[]) {
  return [...metrics].sort((a, b) => {
    const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)

    if (categoryDiff !== 0) {
      return categoryDiff
    }

    return a.item.localeCompare(b.item)
  })
}

export function buildChartData(metrics: FinancialMetric[], periods: string[]) {
  return [...periods].reverse().map(period => {
    const row: Record<string, number | string | null> = {
      period,
      periodLabel: formatPeriod(period),
    }

    metrics.forEach(metric => {
      row[getMetricKey(metric.item)] = metric.values[period] ?? null
    })

    return row
  })
}
