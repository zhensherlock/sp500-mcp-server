import type { CompanyOfficersResult } from './types'

export function parseCompanyOfficersFromToolResult(result: unknown): CompanyOfficersResult {
  if (!result || typeof result !== 'object') {
    throw new Error('Tool result is empty.')
  }

  const structuredContent = 'structuredContent' in result ? result.structuredContent : undefined
  if (structuredContent && typeof structuredContent === 'object') {
    return structuredContent as CompanyOfficersResult
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

  return JSON.parse(textBlock.text) as CompanyOfficersResult
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
