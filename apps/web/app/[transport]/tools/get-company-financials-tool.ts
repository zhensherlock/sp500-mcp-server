import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerAppTool } from '@modelcontextprotocol/ext-apps/server'
import { supabase } from '../utils/supabase'
import { getCompanySymbol, getSummary } from '@/app/[transport]/utils'
import { registerHtmlAppResource } from './app-resource'

const RESOURCE_URI = 'ui://sp500/company-financials.html'
const FINANCIALS_TABLE = 'company_financials'

type FinancialCategory =
  | 'Revenue'
  | 'Profitability'
  | 'Expenses'
  | 'EPS & Shares'
  | 'Interest'
  | 'Tax'
  | 'Unusual Items'
  | 'Industry Specific'
  | 'Other'

const getCompanyFinancialsInputSchema = {
  query: z.string().min(1),
  items: z.array(z.string().min(1)).max(30).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  latest_only: z.boolean().default(false),
  limit: z.number().int().min(1).max(1000).default(500),
}

type GetCompanyFinancialsParams = {
  query: string
  items?: string[]
  start_date?: string
  end_date?: string
  latest_only: boolean
  limit: number
}

type FinancialUnit = 'currency' | 'per_share' | 'shares' | 'ratio' | 'raw'

type FinancialRow = {
  id?: string
  symbol: string
  item: string
  period: string
  value: number
}

type FinancialMetric = {
  item: string
  category: FinancialCategory
  unit: FinancialUnit
  values: Record<string, number>
  latestValue?: number
  previousValue?: number
  change?: number
  changePercent?: number
}

type DerivedMetric = {
  item: string
  category: FinancialCategory
  unit: FinancialUnit
  values: Record<string, number>
  latestValue?: number
  previousValue?: number
  change?: number
}

const metricPriority: Record<string, number> = {
  'Total Revenue': 10,
  'Operating Revenue': 11,
  'Gross Profit': 20,
  'Operating Income': 30,
  EBIT: 35,
  EBITDA: 36,
  'Net Income': 40,
  'Normalized Income': 41,
  'Basic EPS': 50,
  'Diluted EPS': 51,
  'Basic Average Shares': 52,
  'Diluted Average Shares': 53,
  'Cost Of Revenue': 60,
  'Total Expenses': 61,
  'Operating Expense': 62,
  'Research And Development': 63,
  'Selling General And Administration': 64,
  'Tax Provision': 80,
  'Tax Rate For Calcs': 81,
}

const itemAliases: Record<string, string> = {
  revenue: 'Total Revenue',
  sales: 'Total Revenue',
  profit: 'Gross Profit',
  'gross profit': 'Gross Profit',
  'operating income': 'Operating Income',
  ebit: 'EBIT',
  ebitda: 'EBITDA',
  income: 'Net Income',
  'net income': 'Net Income',
  eps: 'Diluted EPS',
  'diluted eps': 'Diluted EPS',
  'basic eps': 'Basic EPS',
  shares: 'Diluted Average Shares',
  expenses: 'Total Expenses',
  tax: 'Tax Provision',
  'tax rate': 'Tax Rate For Calcs',
}

function resolveRequestedItems(items?: string[]) {
  return items?.map(item => itemAliases[item.trim().toLowerCase()] ?? item.trim()).filter(Boolean)
}

function getMetricCategory(item: string): FinancialCategory {
  if (/Revenue|Sales|Interest Income/.test(item)) {
    return 'Revenue'
  }

  if (
    /Gross Profit|Operating Income|Pretax Income|Net Income|Normalized Income|EBIT|EBITDA|Earnings From Equity/.test(
      item,
    )
  ) {
    return 'Profitability'
  }

  if (/Interest|Finance Cost|Securities Amortization/.test(item)) {
    return 'Interest'
  }

  if (/EPS|Shares|Dilution|Preferred Stock Dividend/.test(item)) {
    return 'EPS & Shares'
  }

  if (/Tax|Taxes|Excise/.test(item)) {
    return 'Tax'
  }

  if (
    /Expense|Expenses|Cost Of Revenue|Research And Development|Selling|Marketing|Administrative|Wages|Rent|Occupancy|Provision For Doubtful|Depreciation|Amortization|Depletion/.test(
      item,
    )
  ) {
    return 'Expenses'
  }

  if (/Unusual|Special|Impairment|Restructuring|Write Off|Gain On Sale|Extraordinary/.test(item)) {
    return 'Unusual Items'
  }

  if (/Insurance|Policyholder|Claims|Loss Adjustment/.test(item)) {
    return 'Industry Specific'
  }

  return 'Other'
}

function getMetricUnit(item: string): FinancialUnit {
  if (/EPS/.test(item)) {
    return 'per_share'
  }

  if (/Shares|Dilution/.test(item)) {
    return 'shares'
  }

  if (/Rate|Margin/.test(item)) {
    return 'ratio'
  }

  if (/Tax Effect Of Unusual Items/.test(item)) {
    return 'currency'
  }

  if (
    /Revenue|Income|Profit|Expense|Expenses|Cost|EBIT|EBITDA|Amortization|Depreciation|Provision|Dividend|Interest|Tax|Wages|Rent|Claims|Benefits|Charges|Write Off|Gain|Loss|Impairment|Depletion|Securities/.test(
      item,
    )
  ) {
    return 'currency'
  }

  return 'raw'
}

function parseFinancialRow(row: Record<string, unknown>): FinancialRow | null {
  const symbol = typeof row.symbol === 'string' ? row.symbol : undefined
  const item = typeof row.item === 'string' ? row.item : undefined
  const period = typeof row.period === 'string' ? row.period : undefined
  const value = typeof row.value === 'number' ? row.value : Number(row.value)

  if (!symbol || !item || !period || !Number.isFinite(value)) {
    return null
  }

  return {
    id: typeof row.id === 'string' ? row.id : undefined,
    symbol,
    item,
    period,
    value,
  }
}

async function queryFinancialRows({
  endDate,
  items,
  limit,
  startDate,
  symbol,
}: {
  endDate?: string
  items?: string[]
  limit: number
  startDate?: string
  symbol: string
}) {
  let query = supabase.from(FINANCIALS_TABLE).select('id, symbol, item, period, value').eq('symbol', symbol)

  if (items?.length) {
    query = query.in('item', items)
  }

  if (startDate) {
    query = query.gte('period', startDate)
  }

  if (endDate) {
    query = query.lte('period', endDate)
  }

  const { data, error } = await query.order('period', { ascending: false }).limit(limit)

  if (error) {
    throw new Error(`Unable to query ${FINANCIALS_TABLE}: ${error.message}`)
  }

  const rows = ((Array.isArray(data) ? data : []) as unknown[])
    .map(row => parseFinancialRow(row as Record<string, unknown>))
    .filter((row): row is FinancialRow => Boolean(row))

  return {
    rows,
  }
}

function getSortedPeriods(rows: FinancialRow[]) {
  return Array.from(new Set(rows.map(row => row.period))).sort((a, b) => b.localeCompare(a))
}

function buildMetrics(rows: FinancialRow[], periods: string[]): FinancialMetric[] {
  const metricsByItem = new Map<string, FinancialMetric>()
  const [latestPeriod, previousPeriod] = periods

  rows.forEach(row => {
    const existing = metricsByItem.get(row.item)
    const metric =
      existing ??
      ({
        item: row.item,
        category: getMetricCategory(row.item),
        unit: getMetricUnit(row.item),
        values: {},
      } satisfies FinancialMetric)

    metric.values[row.period] = row.value
    metricsByItem.set(row.item, metric)
  })

  return Array.from(metricsByItem.values())
    .map(metric => {
      const latestValue = latestPeriod ? metric.values[latestPeriod] : undefined
      const previousValue = previousPeriod ? metric.values[previousPeriod] : undefined
      const change = latestValue !== undefined && previousValue !== undefined ? latestValue - previousValue : undefined
      const changePercent =
        change !== undefined && previousValue !== undefined && previousValue !== 0
          ? change / Math.abs(previousValue)
          : undefined

      return {
        ...metric,
        latestValue,
        previousValue,
        change,
        changePercent,
      }
    })
    .sort((a, b) => {
      const categoryOrder = a.category.localeCompare(b.category)

      if (categoryOrder !== 0) {
        return categoryOrder
      }

      return (metricPriority[a.item] ?? 999) - (metricPriority[b.item] ?? 999) || a.item.localeCompare(b.item)
    })
}

function divideValues(
  numerator: FinancialMetric | undefined,
  denominator: FinancialMetric | undefined,
  periods: string[],
  item: string,
): DerivedMetric | null {
  if (!numerator || !denominator) {
    return null
  }

  const values = periods.reduce<Record<string, number>>((acc, period) => {
    const numeratorValue = numerator.values[period]
    const denominatorValue = denominator.values[period]

    if (numeratorValue !== undefined && denominatorValue) {
      acc[period] = numeratorValue / denominatorValue
    }

    return acc
  }, {})

  if (!Object.keys(values).length) {
    return null
  }

  const [latestPeriod, previousPeriod] = periods
  const latestValue = latestPeriod ? values[latestPeriod] : undefined
  const previousValue = previousPeriod ? values[previousPeriod] : undefined
  const change = latestValue !== undefined && previousValue !== undefined ? latestValue - previousValue : undefined

  return {
    item,
    category: 'Profitability',
    unit: 'ratio',
    values,
    latestValue,
    previousValue,
    change,
  }
}

function buildDerivedMetrics(metrics: FinancialMetric[], periods: string[]) {
  const byItem = new Map(metrics.map(metric => [metric.item, metric]))
  const revenue = byItem.get('Total Revenue') ?? byItem.get('Operating Revenue')

  return [
    divideValues(byItem.get('Gross Profit'), revenue, periods, 'Gross Margin'),
    divideValues(byItem.get('Operating Income'), revenue, periods, 'Operating Margin'),
    divideValues(byItem.get('Net Income'), revenue, periods, 'Net Margin'),
    divideValues(byItem.get('EBITDA'), revenue, periods, 'EBITDA Margin'),
  ].filter((metric): metric is DerivedMetric => Boolean(metric))
}

function latestOnlyRows(rows: FinancialRow[]) {
  const [latestPeriod] = getSortedPeriods(rows)

  if (!latestPeriod) {
    return rows
  }

  return rows.filter(row => row.period === latestPeriod)
}

function buildHighlights(metrics: FinancialMetric[], derived: DerivedMetric[], periods: string[]) {
  const byItem = new Map([...metrics, ...derived].map(metric => [metric.item, metric]))
  const [latestPeriod, previousPeriod] = periods
  const focusItems = ['Total Revenue', 'Net Income', 'Diluted EPS', 'Net Margin']

  return focusItems.flatMap(item => {
    const metric = byItem.get(item)

    if (!metric || latestPeriod === undefined || metric.values[latestPeriod] === undefined) {
      return []
    }

    return [
      {
        item,
        unit: metric.unit,
        latestPeriod,
        latestValue: metric.values[latestPeriod],
        previousPeriod,
        previousValue: previousPeriod ? metric.values[previousPeriod] : undefined,
        change: 'change' in metric ? metric.change : undefined,
        changePercent: 'changePercent' in metric ? metric.changePercent : undefined,
      },
    ]
  })
}

export function registerGetCompanyFinancialsTool(mcpServer: McpServer) {
  registerAppTool(
    mcpServer,
    'get_company_financials',
    {
      title: 'Get Company Financials',
      description:
        'Get annual company financial metrics by symbol or company name. Supports filtering by item, date range, and latest period.',
      inputSchema: getCompanyFinancialsInputSchema,
      _meta: { ui: { resourceUri: RESOURCE_URI } },
    },
    async (params: GetCompanyFinancialsParams) => {
      const { end_date, latest_only, limit, query, start_date } = params
      const items = resolveRequestedItems(params.items)

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

      const symbol = await getCompanySymbol({
        query,
        mcpServer,
      })

      const { rows: rawRows } = await queryFinancialRows({
        endDate: end_date,
        items,
        limit,
        startDate: start_date,
        symbol,
      })
      const rows = latest_only ? latestOnlyRows(rawRows) : rawRows

      if (!rows.length) {
        const filters = [
          items?.length && `items ${items.map(item => `"${item}"`).join(', ')}`,
          start_date && `after ${start_date}`,
          end_date && `before ${end_date}`,
          latest_only && 'latest period only',
        ]
          .filter(Boolean)
          .join(', ')
        const filterText = filters ? ` with ${filters}` : ''

        return {
          content: [
            {
              type: 'text',
              text: `No financial metrics found for ${symbol}${filterText}.`,
            },
          ],
        }
      }

      const periods = getSortedPeriods(rows)
      const metrics = buildMetrics(rows, periods)
      const derived = buildDerivedMetrics(metrics, periods)
      const highlights = buildHighlights(metrics, derived, periods)
      const summary = await getSummary({
        text: JSON.stringify({
          symbol,
          periods,
          highlights,
          metricCount: metrics.length,
        }),
        mcpServer,
      })
      const result = {
        symbol,
        periods,
        metrics,
        derived,
        highlights,
        summary,
        metadata: {
          rowCount: rows.length,
          metricCount: metrics.length,
          latestPeriod: periods[0],
          earliestPeriod: periods.at(-1),
          filters: {
            end_date,
            items,
            latest_only,
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

  registerHtmlAppResource(mcpServer, RESOURCE_URI, 'company-financials.html')
}
