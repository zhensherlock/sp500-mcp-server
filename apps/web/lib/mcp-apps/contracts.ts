import { z } from 'zod'

const query = z.string().trim().min(1).max(200).describe('Company ticker or company name, for example AAPL or Apple.')
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()

export const toolSchemas = {
  get_company_info: z.object({ query }),
  get_company_news: z.object({
    query,
    sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  get_company_officers: z.object({ query, limit: z.number().int().min(1).max(50).default(20) }),
  get_company_filings: z.object({
    query,
    filing_type: z.string().max(100).optional(),
    start_date: date,
    end_date: date,
    limit: z.number().int().min(1).max(100).default(20),
  }),
  get_company_financials: z.object({
    query,
    items: z.array(z.string().min(1).max(100)).max(30).optional(),
    start_date: date,
    end_date: date,
    latest_only: z.boolean().default(false),
    limit: z.number().int().min(1).max(1000).default(200),
  }),
  get_company_price_data: z.object({
    query,
    start_date: date,
    end_date: date,
    limit: z.number().int().min(1).max(1000).default(100),
  }),
}

export type CompanyToolName = keyof typeof toolSchemas

export const companyTools = {
  get_company_info: {
    title: 'Company overview',
    description: 'Look up a company, its business, industry, headquarters, and website.',
    page: 'company-info',
  },
  get_company_news: {
    title: 'Company news',
    description: 'Read company news and sentiment from the available database. Cite publication dates and source URLs.',
    page: 'company-news',
  },
  get_company_officers: {
    title: 'Leadership',
    description: 'Look up executive officers, roles, and reported compensation.',
    page: 'company-officers',
  },
  get_company_filings: {
    title: 'SEC filings',
    description:
      'Find SEC filings by company, filing type, and date. Returns filing metadata and links, not full filing text.',
    page: 'company-filings',
  },
  get_company_financials: {
    title: 'Financials',
    description:
      'Retrieve financial metrics and reporting periods. Use items to narrow a question, and compare matching periods and units.',
    page: 'company-financials',
  },
  get_company_price_data: {
    title: 'Price history',
    description:
      'Get historical daily OHLCV prices. This is database history, not a live quote. Use returned dates when explaining results.',
    page: 'company-price-data',
  },
} satisfies Record<CompanyToolName, { title: string; description: string; page: string }>

export const companyToolNameSchema = z.enum(Object.keys(companyTools) as [CompanyToolName, ...CompanyToolName[]])

export function appResourceUri(name: CompanyToolName) {
  return `ui://sp500/${companyTools[name].page}.html`
}

export const mcpToolResultSchema = z
  .object({
    content: z.array(z.record(z.string(), z.unknown())),
    structuredContent: z.record(z.string(), z.unknown()).optional(),
    isError: z.boolean().optional(),
    _meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough()

export const inputRequiredSchema = z.object({
  resultType: z.literal('input_required'),
  requestState: z.string().optional(),
  inputRequests: z
    .record(
      z.string(),
      z.object({
        method: z.literal('elicitation/create'),
        params: z.object({ message: z.string(), requestedSchema: z.record(z.string(), z.unknown()) }).passthrough(),
      }),
    )
    .default({}),
})

export type McpToolResult = z.infer<typeof mcpToolResultSchema>
export type InputRequired = z.infer<typeof inputRequiredSchema>
export type McpInputResponse = { action: 'accept' | 'cancel' | 'decline'; content?: Record<string, unknown> }

export type McpAppToolOutput = {
  kind: 'sp500-mcp-app'
  toolName: CompanyToolName
  resourceUri: string
  result: McpToolResult
  elapsedMs: number
}

export function isMcpAppToolOutput(value: unknown): value is McpAppToolOutput {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    record.kind === 'sp500-mcp-app' &&
    companyToolNameSchema.safeParse(record.toolName).success &&
    mcpToolResultSchema.safeParse(record.result).success
  )
}

export function companyChoice(request: InputRequired['inputRequests'][string]) {
  const properties = request.params.requestedSchema.properties
  if (!properties || typeof properties !== 'object') throw new Error('The MCP server requested an unsupported form.')
  for (const [field, value] of Object.entries(properties)) {
    if (!value || typeof value !== 'object' || !('enum' in value) || !Array.isArray(value.enum)) continue
    const options = (value.enum as unknown[]).filter((entry): entry is string => typeof entry === 'string')
    if (options.length) return { field, options }
  }
  throw new Error('The MCP server requested an unsupported form.')
}
