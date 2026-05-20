export interface ToolParam {
  name: string
  type: string
  required: boolean
  description: string
}

export interface Tool {
  name: string
  description: string
  params: ToolParam[]
  sampleParams: Record<string, string>
  returns: string
}

export const tools: Tool[] = [
  {
    name: 'get_company_info',
    description:
      'Get complete company basic information including financials, leadership, address, and business summary. Supports both symbol and company name queries.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Company symbol (e.g., AAPL) or company name (e.g., Apple)',
      },
    ],
    sampleParams: {
      query: 'Apple',
    },
    returns: `{
  "symbol": "AAPL",
  "shortName": "Apple Inc.",
  "longName": "Apple Inc.",
  "displayName": "Apple Inc.",
  "quoteType": "EQUITY",
  "address": "One Apple Park Way",
  "city": "Cupertino",
  "zip": "95014",
  "country": "United States",
  "phone": "+1-408-996-1010",
  "website": "https://www.apple.com",
  "irWebsite": "https://investor.apple.com",
  "sector": "Technology",
  "sectorKey": "TECHNOLOGY",
  "industry": "Consumer Electronics",
  "industryKey": "CONSUMER_ELECTRONICS",
  "longBusinessSummary": "Apple Inc. designs, manufactures, and markets smartphones...",
  "fullTimeEmployees": 164000
}`,
  },
  {
    name: 'get_company_news',
    description: 'Get recent company news with sentiment analysis, supports filtering by symbol and sentiment.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Company symbol (e.g., AAPL) or company name (e.g., Apple)',
      },
      {
        name: 'sentiment',
        type: 'string',
        required: false,
        description: 'Filter by sentiment (positive, negative, neutral)',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Maximum number of results (1-100, default: 10)',
      },
    ],
    sampleParams: {
      query: 'Apple',
      sentiment: 'positive',
      limit: '5',
    },
    returns: `{
  "symbol": "AAPL",
  "news": [
    {
      "title": "Apple Reports Record Q4 Earnings",
      "summary": "Apple Inc. announced record quarterly revenue...",
      "provider": "Reuters",
      "pubDate": "2024-01-15",
      "sentiment": "positive",
      "url": "https://example.com/news/123",
      "thumbnail": "https://example.com/thumb.jpg",
      "lm_level": 1,
      "lm_score1": 0.85
    }
  ]
}`,
  },
  {
    name: 'get_company_officers',
    description: 'Get company executive officers and their compensation info, supports filtering by symbol',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Search query (symbol, short name, or long name)',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Maximum number of officers to return (1-50, default: 20)',
      },
    ],
    sampleParams: {
      query: 'Apple',
      limit: '10',
    },
    returns: `{
  "symbol": "AAPL",
  "officers": [
    {
      "name": "Mr. Timothy D. Cook",
      "age": 64,
      "title": "CEO & Director",
      "totalPay": 16759518
    },
    {
      "name": "Ms. Deirdre O'Brien",
      "age": 58,
      "title": "Senior Vice President of Retail & People",
      "totalPay": 5037867
    }
  ]
}`,
  },
  {
    name: 'get_company_filings',
    description: 'Get SEC filings history for a company, supports filtering by symbol, date range, and filing type',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Search query (symbol, short name, or long name)',
      },
      {
        name: 'filing_type',
        type: 'string',
        required: false,
        description: 'Filter by filing type (e.g., 10-K, 10-Q, 8-K, PRE 14A, DEF 14A)',
      },
      {
        name: 'start_date',
        type: 'string',
        required: false,
        description: 'Filter filings from this date (YYYY-MM-DD)',
      },
      {
        name: 'end_date',
        type: 'string',
        required: false,
        description: 'Filter filings until this date (YYYY-MM-DD)',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Maximum number of filings to return (1-100, default: 20)',
      },
    ],
    sampleParams: {
      query: 'Apple',
      filing_type: '10-K',
      limit: '5',
    },
    returns: `{
  "symbol": "AAPL",
  "filings": [
    {
      "filing_date": "2026-03-20",
      "filing_type": "8-K",
      "title": "Corporate Changes & Voting Matters",
      "edgarUrl": "https://finance.yahoo.com/sec-filing/A/0001193125-26-117614_1090872"
    }
  ]
}`,
  },
  {
    name: 'get_company_financials',
    description:
      'Get annual company financial metrics, grouped for charting and matrix analysis. Supports item, date range, and latest-period filters.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Search query (symbol, short name, or long name)',
      },
      {
        name: 'items',
        type: 'string[]',
        required: false,
        description: 'Exact financial items or common aliases, such as revenue, net income, EBITDA, or diluted EPS',
      },
      {
        name: 'start_date',
        type: 'string',
        required: false,
        description: 'Filter financial periods from this date (YYYY-MM-DD)',
      },
      {
        name: 'end_date',
        type: 'string',
        required: false,
        description: 'Filter financial periods until this date (YYYY-MM-DD)',
      },
      {
        name: 'latest_only',
        type: 'boolean',
        required: false,
        description: 'Return only the latest available reporting period',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Maximum source rows to read (1-1000, default: 500)',
      },
    ],
    sampleParams: {
      query: 'Apple',
      items: 'revenue, net income',
      latest_only: 'false',
      limit: '500',
    },
    returns: `{
  "symbol": "AAPL",
  "periods": ["2025-09-30", "2024-09-30"],
  "metrics": [
    {
      "item": "Total Revenue",
      "unit": "currency",
      "values": {
        "2025-09-30": 416161000000,
        "2024-09-30": 391035000000
      },
      "changePercent": 0.0643
    }
  ],
  "derived": [
    {
      "item": "Net Margin",
      "unit": "ratio",
      "values": {
        "2025-09-30": 0.2691,
        "2024-09-30": 0.2397
      }
    }
  ]
}`,
  },
  {
    name: 'get_company_price_data',
    description: 'Get historical daily OHLCV price data for a company. Returns a plain list of price rows.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Company symbol (e.g., AAPL) or company name (e.g., Apple)',
      },
      {
        name: 'start_date',
        type: 'string',
        required: false,
        description: 'Filter price rows from this date (YYYY-MM-DD)',
      },
      {
        name: 'end_date',
        type: 'string',
        required: false,
        description: 'Filter price rows until this date (YYYY-MM-DD)',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Maximum number of rows to return (1-1000, default: 100)',
      },
    ],
    sampleParams: {
      query: 'Apple',
      start_date: '2026-01-01',
      limit: '100',
    },
    returns: `{
  "symbol": "AAPL",
  "prices": [
    {
      "trade_date": "2026-04-30",
      "open": 270.12,
      "high": 272.88,
      "low": 268.75,
      "close": 271.35,
      "volume": 58234100
    }
  ],
  "metadata": {
    "rowCount": 1,
    "latestTradeDate": "2026-04-30",
    "earliestTradeDate": "2026-04-30"
  }
}`,
  },
]
