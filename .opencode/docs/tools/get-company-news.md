---
filename: get-company-news-tool.ts
name: get_company_news
title: Get Company News
description: Get recent company news with sentiment analysis, supports filtering by symbol and sentiment
inputSchema:
  - name: query
    type: string
    required: true
    describe: Search query (symbol, short name, or long name)
  - name: sentiment
    type: string
    required: false
    describe: Filter by sentiment (positive, negative, neutral)
  - name: limit
    type: number
    required: false
    describe: Maximum number of news to return (default: 10)
---

# get_company_news

Get recent company news with sentiment analysis, supports filtering by symbol and sentiment.

## Tool Information

| Field | Value |
|-------|-------|
| Name | `get_company_news` |
| Title | Get Company News |
| Description | Get recent company news with sentiment analysis, supports filtering by symbol and sentiment. |

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (symbol, short name, or long name) |
| `sentiment` | string | No | Filter by sentiment (positive, negative, neutral) |
| `limit` | number | No | Maximum number of news to return (default: 10) |

## Input Schema

```typescript
{
  query: z.string().min(1),
  sentiment?: z.enum(["positive", "negative", "neutral"]).optional(),
  limit?: z.number().min(1).max(100).default(10),
}
```

## Database

**Table**: `company_news_sentiment`

**Columns**: `symbol`, `title`, `summary`, `provider`, `pubDate`, `thumbnail`, `url`, `lm_level`, `lm_score1`, `lm_score2`, `lm_sentiment`

## Query Logic

1. Resolve `query` to a stock symbol via `getCompanySymbol` utility (reports not found via MCP if no match)
2. Filter news by `symbol` + optional `sentiment`
3. Sort by `pubDate` descending
4. Limit results to `limit` rows

## Response

```typescript
{
  symbol: "MMM",
  news: [
    {
      title: "Nordson's Earnings Surpass Estimates in Q1, Revenues Up Y/Y",
      summary: "NDSN posts 15% EPS growth in Q1 fiscal 2026...",
      provider: "Zacks",
      pubDate: "2026-02-19 15:25:00",
      sentiment: "positive",
      url: "https://finance.yahoo.com/news/nordsons-earnings-surpass-estimates-q1-152500868.html",
      thumbnail: "https://media.zenfs.com/en/zacks.com/4b62e8c333b4d6c7a8510ef8893872b7",
      lm_level: 1,
      lm_score1: 0.07142857142857142
    }
  ]
}
```

## Error Responses

| Scenario | Response |
|----------|----------|
| Company not found | `Company not found` (from getCompanySymbol) |
| No news found | `No news found for {symbol}[ with {sentiment} sentiment].` |

## Usage Example

```typescript
const res = await client.callTool({
  name: "get_company_news",
  arguments: {
    query: "MMM",
    sentiment: "positive",
    limit: 5
  }
});
```

## File Location

`app/[transport]/tools/get-company-news-tool.ts`
