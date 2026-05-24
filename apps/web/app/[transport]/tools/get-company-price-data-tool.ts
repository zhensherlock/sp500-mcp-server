import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerAppTool } from '@modelcontextprotocol/ext-apps/server'
import { supabase } from '../utils/supabase'
import { getCompanySymbol } from '@/app/[transport]/utils'
import { registerHtmlAppResource } from './app-resource'

const RESOURCE_URI = 'ui://sp500/company-price-data.html'
const PRICE_DATA_TABLE = 'company_price_data'

const getCompanyPriceDataInputSchema = {
  query: z.string().min(1),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.number().int().min(1).max(1000).default(100),
}

type GetCompanyPriceDataParams = {
  query: string
  start_date?: string
  end_date?: string
  limit: number
}

type PriceDataRow = {
  trade_date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

function normalizeSymbol(value: string) {
  return value.trim().toUpperCase()
}

function isLikelySymbol(value: string) {
  return /^[A-Z0-9.-]{1,12}$/.test(value)
}

function parsePriceDataRow(row: Record<string, unknown>): PriceDataRow | null {
  const tradeDate = typeof row.trade_date === 'string' ? row.trade_date : undefined
  const open = Number(row.open)
  const high = Number(row.high)
  const low = Number(row.low)
  const close = Number(row.close)
  const volume = Number(row.volume)

  if (
    !tradeDate ||
    !Number.isFinite(open) ||
    !Number.isFinite(high) ||
    !Number.isFinite(low) ||
    !Number.isFinite(close) ||
    !Number.isFinite(volume)
  ) {
    return null
  }

  return {
    trade_date: tradeDate,
    open,
    high,
    low,
    close,
    volume,
  }
}

async function hasPriceDataForSymbol(symbol: string) {
  const { data, error } = await supabase.from(PRICE_DATA_TABLE).select('symbol').eq('symbol', symbol).limit(1)

  if (error) {
    throw new Error(`Unable to query ${PRICE_DATA_TABLE}: ${error.message}`)
  }

  return Boolean(data?.length)
}

async function resolvePriceDataSymbol({ mcpServer, query }: { mcpServer: McpServer; query: string }) {
  const directSymbol = normalizeSymbol(query)

  if (isLikelySymbol(directSymbol) && (await hasPriceDataForSymbol(directSymbol))) {
    return directSymbol
  }

  return getCompanySymbol({
    query,
    mcpServer,
  })
}

export function registerGetCompanyPriceDataTool(mcpServer: McpServer) {
  registerAppTool(
    mcpServer,
    'get_company_price_data',
    {
      title: 'Get Company Price Data',
      description: 'Get historical daily OHLCV price data for a company by symbol or company name.',
      inputSchema: getCompanyPriceDataInputSchema,
      _meta: { ui: { resourceUri: RESOURCE_URI } },
    },
    async (params: GetCompanyPriceDataParams) => {
      const { end_date, limit, query, start_date } = params

      if (start_date && end_date && start_date > end_date) {
        return {
          content: [
            {
              type: 'text',
              text: 'start_date must be before or equal to end_date.',
            },
          ],
        }
      }

      const symbol = await resolvePriceDataSymbol({
        mcpServer,
        query,
      })

      let priceDataQuery = supabase
        .from(PRICE_DATA_TABLE)
        .select('trade_date, open, high, low, close, volume')
        .eq('symbol', symbol)

      if (start_date) {
        priceDataQuery = priceDataQuery.gte('trade_date', start_date)
      }

      if (end_date) {
        priceDataQuery = priceDataQuery.lte('trade_date', end_date)
      }

      const { data, error } = await priceDataQuery.order('trade_date', { ascending: false }).limit(limit)

      if (error) {
        throw new Error(`Unable to query ${PRICE_DATA_TABLE}: ${error.message}`)
      }

      const prices = ((Array.isArray(data) ? data : []) as unknown[])
        .map(row => parsePriceDataRow(row as Record<string, unknown>))
        .filter((row): row is PriceDataRow => Boolean(row))

      if (!prices.length) {
        const filters = [start_date && `after ${start_date}`, end_date && `before ${end_date}`]
          .filter(Boolean)
          .join(', ')
        const filterText = filters ? ` with ${filters}` : ''

        return {
          content: [
            {
              type: 'text',
              text: `No price data found for ${symbol}${filterText}. Try adjusting the date range.`,
            },
          ],
        }
      }
      const result = {
        symbol,
        prices,
        metadata: {
          rowCount: prices.length,
          latestTradeDate: prices[0]?.trade_date,
          earliestTradeDate: prices.at(-1)?.trade_date,
          filters: {
            end_date,
            limit,
            start_date,
          },
        },
      }

      return {
        structuredContent: result,
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      }
    },
  )

  registerHtmlAppResource(mcpServer, RESOURCE_URI, 'company-price-data.html')
}
