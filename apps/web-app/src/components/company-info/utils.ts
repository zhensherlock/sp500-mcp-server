import type { CompanyInfo } from './types'

const textContentTypes = new Set(['text'])

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
  if (!result || typeof result !== 'object') {
    throw new Error('Tool result is empty.')
  }

  const structuredContent = 'structuredContent' in result ? result.structuredContent : undefined
  if (structuredContent && typeof structuredContent === 'object') {
    return structuredContent as CompanyInfo
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
      textContentTypes.has(String(block.type)) &&
      'text' in block &&
      typeof block.text === 'string',
  )

  if (!textBlock || !('text' in textBlock) || typeof textBlock.text !== 'string') {
    throw new Error('Tool result has no text content.')
  }

  return JSON.parse(textBlock.text) as CompanyInfo
}
