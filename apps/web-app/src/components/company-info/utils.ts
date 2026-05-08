import type { CompanyInfo } from './types'
import { parseToolResult } from '@/components/tool-app/parse-tool-result'

export function formatEmployees(value: number) {
  if (!Number.isFinite(value)) {
    return '-'
  }

  return value >= 1000 ? `${(value / 1000).toFixed(0)}K` : String(value)
}

export function getSummaryPreview(summary: string, maxLength = 300) {
  const isLong = summary.length > maxLength

  return {
    isLong,
    preview: isLong ? `${summary.slice(0, maxLength)}...` : summary,
  }
}

export function parseCompanyInfoFromToolResult(result: unknown): CompanyInfo {
  return parseToolResult<CompanyInfo>(result)
}
