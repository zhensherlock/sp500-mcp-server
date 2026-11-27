import { searchCompanies } from './searchCompanies'
import {
  acceptedContent,
  CLIENT_CAPABILITIES_META_KEY,
  inputRequired,
  inputResponse,
  type ClientCapabilities,
  type InputRequiredResult,
  type McpServer,
  type ServerContext,
} from '@modelcontextprotocol/server'
import { z } from 'zod'

const COMPANY_INPUT_KEY = 'company'

export class CompanyNotFoundError extends Error {
  constructor(query: string) {
    super(`No companies found matching "${query}". Please try a different company name or symbol.`)
  }
}

type Options = {
  query: string
  mcpServer: McpServer
  ctx: ServerContext
}

export async function getCompanySymbol(options: Options): Promise<string | InputRequiredResult> {
  const { ctx, query, mcpServer } = options
  const companies = await searchCompanies(query.trim())

  if (!companies.length) throw new CompanyNotFoundError(query)

  if (companies.length === 1) {
    return companies[0].symbol
  }

  const response = inputResponse(ctx.mcpReq.inputResponses, COMPANY_INPUT_KEY)
  if (response.kind === 'elicit' && response.action !== 'accept') {
    throw new Error('User cancelled the query')
  }

  const symbols = companies.map(company => company.symbol) as [string, ...string[]]
  const selectionSchema = z.object({
    companyName: z.enum(symbols).meta({ title: 'Company' }),
  })
  const selection = acceptedContent(ctx.mcpReq.inputResponses, COMPANY_INPUT_KEY, selectionSchema)

  if (selection) {
    return selection.companyName
  }

  const envelope = ctx.mcpReq.envelope as Record<string, unknown> | undefined
  const capabilities =
    (envelope?.[CLIENT_CAPABILITIES_META_KEY] as ClientCapabilities | undefined) ??
    mcpServer.server.getClientCapabilities()
  const elicitation = capabilities?.elicitation
  const supportsFormElicitation = Boolean(
    elicitation && (elicitation.form || (!('form' in elicitation) && !('url' in elicitation))),
  )

  if (supportsFormElicitation) {
    const choices = companies
      .map(({ symbol, longName, displayName, shortName }) => {
        const name = longName?.trim() || displayName?.trim() || shortName?.trim()
        return name ? `${symbol} — ${name}` : symbol
      })
      .join('\n')

    return inputRequired({
      inputRequests: {
        [COMPANY_INPUT_KEY]: inputRequired.elicit({
          message: `Which company would you like to query?\n${choices}`,
          requestedSchema: selectionSchema,
        }),
      },
    })
  }

  return companies[0].symbol
}
