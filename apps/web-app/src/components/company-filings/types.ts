export type CompanyFiling = {
  filing_date: string
  filing_type: string
  title: string
  edgarUrl: string
}

export type CompanyFilingsResult = {
  symbol: string
  filings: CompanyFiling[]
  summary?: string
}

export type AppStatus = 'connecting' | 'ready' | 'error'
