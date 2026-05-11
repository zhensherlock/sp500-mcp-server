export type FinancialCategory =
  | 'Revenue'
  | 'Profitability'
  | 'Expenses'
  | 'EPS & Shares'
  | 'Interest'
  | 'Tax'
  | 'Unusual Items'
  | 'Industry Specific'
  | 'Other'

export type FinancialUnit = 'currency' | 'per_share' | 'shares' | 'ratio' | 'raw'

export type FinancialMetric = {
  item: string
  category: FinancialCategory
  unit: FinancialUnit
  values: Record<string, number>
  latestValue?: number
  previousValue?: number
  change?: number
  changePercent?: number
}

export type DerivedFinancialMetric = {
  item: string
  category: FinancialCategory
  unit: FinancialUnit
  values: Record<string, number>
  latestValue?: number
  previousValue?: number
  change?: number
}

export type FinancialHighlight = {
  item: string
  unit: FinancialUnit
  latestPeriod: string
  latestValue: number
  previousPeriod?: string
  previousValue?: number
  change?: number
  changePercent?: number
}

export type CompanyFinancialsResult = {
  symbol: string
  periods: string[]
  metrics: FinancialMetric[]
  derived?: DerivedFinancialMetric[]
  highlights?: FinancialHighlight[]
  summary?: string
  metadata?: {
    rowCount: number
    metricCount: number
    latestPeriod?: string
    earliestPeriod?: string
    filters?: Record<string, unknown>
  }
}
