export type CompanyPriceDataRow = {
  trade_date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type CompanyPriceRange = 'month' | 'year'

export type CompanyPriceDataArguments = {
  query: string
  start_date: string
  end_date: string
  limit: number
}

export type RequestCompanyPrices = (arguments_: CompanyPriceDataArguments) => Promise<unknown>

export type CompanyPriceDataResult = {
  symbol: string
  prices: CompanyPriceDataRow[]
  metadata?: {
    rowCount: number
    latestTradeDate?: string
    earliestTradeDate?: string
    filters?: Record<string, unknown>
  }
}
