export type CompanyPriceDataRow = {
  trade_date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

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
