export const tools: Array<{
  name: string;
  description: string;
  params: Array<{ name: string; type: string; required: boolean; description: string }>;
  returns: string;
}> = [
  {
    name: "search_companies",
    description:
      "Fuzzy search for companies by symbol, name, sector, or industry. Returns concise company information. Use symbol to call get_company_info for full details.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Search keyword for fuzzy matching against symbol, name, sector, or industry",
      },
      {
        name: "sector",
        type: "string",
        required: false,
        description: "Filter by sector (e.g., Technology, Healthcare)",
      },
      {
        name: "industry",
        type: "string",
        required: false,
        description: "Filter by industry",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Maximum number of results to return (1-20, default: 5)",
      },
    ],
    returns: `{
  "companies": [
    {
      "symbol": "AAPL",
      "shortName": "Apple Inc.",
      "longName": "Apple Inc.",
      "sector": "Technology",
      "industry": "Consumer Electronics"
    }
  ],
  "prompt": "Which company would you like to query?"
}`,
  },
  {
    name: "get_company_info",
    description:
      "Get complete company basic information including financials, leadership, address, and business summary. Supports both symbol and company name queries.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Company symbol (e.g., AAPL) or company name (e.g., Apple)",
      },
    ],
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
    name: "get_company_news",
    description:
      "Get recent company news with sentiment analysis, supports filtering by symbol and sentiment.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Company symbol (e.g., AAPL) or company name (e.g., Apple)",
      },
      {
        name: "sentiment",
        type: "string",
        required: false,
        description: "Filter by sentiment (positive, negative, neutral)",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Maximum number of results (1-100, default: 10)",
      },
    ],
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
    name: "get_company_officers",
    description:
      "Get company executive officers and their compensation info, supports filtering by symbol",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Search query (symbol, short name, or long name)",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Maximum number of officers to return (1-50, default: 20)",
      },
    ],
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
];