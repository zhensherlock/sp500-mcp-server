export type CompanyInfo = {
  symbol?: string
  shortName: string
  longName?: string
  displayName?: string
  quoteType: string
  address: string
  city: string
  zip: string
  country: string
  phone: string
  website: string
  irWebsite: string
  sector: string
  sectorKey?: string
  industry?: string
  industryKey?: string
  longBusinessSummary: string
  fullTimeEmployees: number
  summary?: string
}

export type AppStatus = 'connecting' | 'ready' | 'error'
