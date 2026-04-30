import { supabase } from './supabase'

interface CompanySearchResult {
  symbol: string
  shortName: string
  longName: string
  displayName: string
}

interface SearchCompaniesResponse {
  success: boolean
  data: CompanySearchResult[]
}

export async function searchCompanies(query: string, limit: number = 5): Promise<SearchCompaniesResponse> {
  try {
    const searchPattern = `%${query}%`
    const { data, error } = await supabase
      .from('company_info')
      .select('symbol, shortName, longName, displayName, sector, industry')
      .or(
        `symbol.ilike.${searchPattern},shortName.ilike.${searchPattern},longName.ilike.${searchPattern},displayName.ilike.${searchPattern}`,
      )
      .limit(limit)

    if (error) {
      return { success: false, data: [] }
    }

    return { success: true, data }
  } catch {
    return { success: false, data: [] }
  }
}
