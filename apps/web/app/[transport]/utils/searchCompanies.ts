import { supabase } from './supabase'

const companyFields = 'symbol, shortName, longName, displayName'

export async function searchCompanies(query: string, limit = 5) {
  if (!query) return []

  if (/^[a-z0-9][a-z0-9.-]*$/i.test(query)) {
    const { data, error } = await supabase.from('company_info').select(companyFields).eq('symbol', query.toUpperCase())
    if (error) throw new Error('Could not search for companies.', { cause: error })
    if (data.length) return data
  }

  // Escape SQL LIKE wildcards, then quote the value for the PostgREST OR filter.
  const literal = query.replace(/[\\%_*]/g, '\\$&').replace(/[\\"]/g, '\\$&')
  const pattern = `"%${literal}%"`
  const { data, error } = await supabase
    .from('company_info')
    .select(companyFields)
    .or(`symbol.ilike.${pattern},shortName.ilike.${pattern},longName.ilike.${pattern},displayName.ilike.${pattern}`)
    .order('symbol')
    .limit(limit)
  if (error) throw new Error('Could not search for companies.', { cause: error })
  return data
}
