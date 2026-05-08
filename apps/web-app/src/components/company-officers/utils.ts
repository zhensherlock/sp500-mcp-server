import type { CompanyOfficersResult } from './types'
import { parseToolResult } from '@/components/tool-app/parse-tool-result'

export function parseCompanyOfficersFromToolResult(result: unknown): CompanyOfficersResult {
  return parseToolResult<CompanyOfficersResult>(result)
}

export function formatTotalPay(value?: number | string | null) {
  if (value === null || value === undefined || value === '') {
    return 'Not disclosed'
  }

  const numericValue = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numericValue)) {
    return 'Not disclosed'
  }

  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(numericValue)
}
