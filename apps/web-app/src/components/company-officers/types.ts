export type CompanyOfficer = {
  name: string
  age?: number | null
  title: string
  totalPay?: number | string | null
}

export type CompanyOfficersResult = {
  symbol: string
  officers: CompanyOfficer[]
  summary?: string
}

export type AppStatus = 'connecting' | 'ready' | 'error'
