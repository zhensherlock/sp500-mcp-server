export type NewsSentiment = 'positive' | 'negative' | 'neutral'

export type CompanyNewsItem = {
  symbol: string
  title: string
  summary: string
  provider: string
  pubDate: string
  url: string
  lm_level?: string | null
  lm_score1?: number | null
  lm_score2?: number | null
  lm_sentiment: NewsSentiment
}

export type CompanyNewsResult = {
  symbol: string
  news: CompanyNewsItem[]
  summary?: string
}

export type AppStatus = 'connecting' | 'ready' | 'error'
