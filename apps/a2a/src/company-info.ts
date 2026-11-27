import { isInputRequiredResult, type InputRequiredResult } from '@modelcontextprotocol/client'
import { callMcpTool } from './mcp.js'

export type CompanyProfile = Record<string, unknown> & { symbol: string }

export type CompanyChoice = {
  query: string
  prompt: string
  symbols: string[]
  requestState?: string
}

export function readCompanyChoice(query: string, result: InputRequiredResult): CompanyChoice {
  const request = result.inputRequests?.company
  if (request?.method !== 'elicitation/create' || !('requestedSchema' in request.params)) {
    throw new Error('MCP tool requested an unsupported company selection form.')
  }

  const field = request.params.requestedSchema.properties?.companyName
  const symbols = field && 'enum' in field ? field.enum : undefined
  if (!Array.isArray(symbols) || !symbols.length || !symbols.every(symbol => typeof symbol === 'string')) {
    throw new Error('MCP tool did not provide valid company choices.')
  }

  return { query, prompt: request.params.message, symbols, requestState: result.requestState }
}

export async function getCompanyInfo(query: string, selection?: { symbol: string; requestState?: string }) {
  const result = await callMcpTool('get_company_info', { query }, selection)
  if (isInputRequiredResult(result)) return { kind: 'choose' as const, choice: readCompanyChoice(query, result) }
  if (result.isError) {
    // The deployed MCP may report a missing company as text without the error code.
    const noMatchText = `No companies found matching "${query}". Please try a different company name or symbol.`
    if (
      result._meta?.['sp500/companyLookupError'] === 'not_found' ||
      result.content.some(part => part.type === 'text' && part.text === noMatchText)
    ) {
      return { kind: 'not_found' as const }
    }
    throw new Error('get_company_info returned an error.')
  }

  const data = result.structuredContent
  if (!data || typeof data !== 'object' || !('symbol' in data) || typeof data.symbol !== 'string' || !data.symbol) {
    throw new Error('get_company_info returned invalid company data.')
  }

  const company: CompanyProfile = { ...data, symbol: data.symbol }
  return { kind: 'found' as const, company }
}
