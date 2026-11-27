import { isInputRequiredResult } from '@modelcontextprotocol/client'
import type { CompanyProfile } from './company-info.js'
import { callMcpTool } from './mcp.js'

const revenueItem = 'Total Revenue'
const incomeItem = 'Net Income'
const newsLimit = 3
const amountFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 })

type Section<T> = { status: 'available'; data: T } | { status: 'empty' | 'unavailable' }
type OnSectionReady = (section: 'financials' | 'news', status: Section<unknown>['status']) => void

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
}

function asLine(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() || null : null
}

async function loadSection<T>(
  name: 'get_company_financials' | 'get_company_news',
  symbol: string,
  args: Record<string, unknown>,
  noResults: string,
  read: (data: Record<string, unknown>) => T,
): Promise<Section<T>> {
  try {
    const result = await callMcpTool(name, { ...args, query: symbol })
    if (isInputRequiredResult(result) || result.isError) throw new Error('Tool did not complete successfully.')

    const data = asRecord(result.structuredContent)
    if (data?.symbol === symbol) return { status: 'available', data: read(data) }
    if (!data && result.content.some(part => part.type === 'text' && part.text.startsWith(noResults))) {
      return { status: 'empty' }
    }
    throw new Error('Tool returned unexpected company data.')
  } catch (error) {
    console.error(`MCP ${name} failed for ${symbol}:`, error)
    return { status: 'unavailable' }
  }
}

function readFinancials({ periods, highlights }: Record<string, unknown>) {
  if (!Array.isArray(periods) || typeof periods[0] !== 'string' || !Array.isArray(highlights)) {
    throw new Error('Invalid financial period or highlights.')
  }

  const period: string = periods[0]
  const values = new Map<string, number>()
  for (const entry of highlights) {
    const metric = asRecord(entry)
    if (typeof metric?.item !== 'string' || metric.latestPeriod !== period) continue
    if (typeof metric.latestValue === 'number' && Number.isFinite(metric.latestValue)) {
      values.set(metric.item, metric.latestValue)
    }
  }

  return { period, revenue: values.get(revenueItem) ?? null, netIncome: values.get(incomeItem) ?? null }
}

function readNews({ news }: Record<string, unknown>) {
  if (!Array.isArray(news)) throw new Error('Invalid news list.')

  return news.slice(0, newsLimit).flatMap(entry => {
    const item = asRecord(entry)
    const title = asLine(item?.title)
    if (!title) return []
    return [{ title, pubDate: asLine(item?.pubDate), provider: asLine(item?.provider), url: asLine(item?.url) }]
  })
}

function financialLines(section: Section<ReturnType<typeof readFinancials>>) {
  if (section.status === 'unavailable') return ['Annual financials', 'Financial data is temporarily unavailable.']
  if (section.status !== 'available') return ['Annual financials', 'No financial data returned.']

  const { period, revenue, netIncome } = section.data
  const amount = (value: number | null) => (value === null ? 'Unavailable' : amountFormatter.format(value))
  return [
    `Annual financials (period ended ${period})`,
    `Revenue: ${amount(revenue)} · Net income: ${amount(netIncome)} (reported currency)`,
  ]
}

function newsLines(section: Section<ReturnType<typeof readNews>>) {
  if (section.status === 'unavailable') return ['News is temporarily unavailable.']
  if (section.status !== 'available' || !section.data.length) return ['No news returned.']

  return section.data.map(({ title, pubDate, provider }) => {
    const date = pubDate?.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
    return `- ${[date, provider, title].filter(Boolean).join(' · ')}`
  })
}

export async function buildCompanyBrief(company: CompanyProfile, onSectionReady: OnSectionReady) {
  const { symbol } = company
  const [financials, latestNews] = await Promise.all([
    loadSection(
      'get_company_financials',
      symbol,
      { items: [revenueItem, incomeItem], latest_only: true },
      `No financial metrics found for ${symbol}`,
      readFinancials,
    ).then(section => {
      onSectionReady('financials', section.status)
      return section
    }),
    loadSection('get_company_news', symbol, { limit: newsLimit }, `No news found for ${symbol}`, readNews).then(
      section => {
        onSectionReady('news', section.status === 'available' && !section.data.length ? 'empty' : section.status)
        return section
      },
    ),
  ])

  const name = asLine(company.longName) ?? asLine(company.displayName) ?? asLine(company.shortName)
  const title = name ? `${name} (${symbol})` : symbol
  const text = [
    `${title} — Company brief`,
    `Sector: ${asLine(company.sector) ?? 'Unavailable'} · Industry: ${asLine(company.industry) ?? 'Unavailable'}`,
    '',
    ...financialLines(financials),
    '',
    'Latest available news',
    ...newsLines(latestNews),
  ].join('\n')

  return { text, data: { ...company, financials, latestNews } }
}
