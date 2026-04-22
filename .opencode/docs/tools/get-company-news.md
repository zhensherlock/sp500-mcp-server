---
filename: get-company-news-tool.ts
name: get_company_news
title: Get Company News
description: Get recent company news with sentiment analysis, supports filtering by symbol, sentiment, and time range
inputSchema:
  - name: query
    type: string
    required: true
    describe: Search query (symbol, short name, or long name)
  - name: sentiment
    type: string
    required: false
    describe: Filter by sentiment (positive, negative, neutral)
  - name: days
    type: number
    required: false
    describe: Number of days to look back (default: 7)
  - name: limit
    type: number
    required: false
    describe: Maximum number of news to return (default: 10)
---

# get_company_news

Get recent company news with sentiment analysis, supports filtering by symbol, sentiment, and time range.

## Tool Information

| Field | Value |
|-------|-------|
| Name | `get_company_news` |
| Title | Get Company News |
| Description | Get recent company news with sentiment analysis, supports filtering by symbol, sentiment, and time range. |

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (symbol, short name, or long name) |
| `sentiment` | string | No | Filter by sentiment (positive, negative, neutral) |
| `days` | number | No | Number of days to look back (default: 7) |
| `limit` | number | No | Maximum number of news to return (default: 10) |

## Input Schema

```typescript
{
  query: z.string().min(1),
  sentiment?: z.enum(["positive", "negative", "neutral"]).optional(),
  days?: z.number().min(1).max(365).default(7),
  limit?: z.number().min(1).max(100).default(10),
}
```

## Database

**Table**: `company_news_sentiment`

**Columns**: `symbol`, `title`, `summary`, `provider`, `pubDate`, `thumbnail`, `url`, `lm_level`, `lm_score1`, `lm_score2`, `lm_sentiment`

## Query Logic

1. First resolve `query` to a stock symbol (via `company_info` table, same as `get_company_info`)
2. Filter news by `symbol` + optional `sentiment` + optional `days` range
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
| Database error | `Error getting company news: {error.message}` |
| Company not found | `Company not found` |
| No news found | `{ symbol: "MMM", news: [] }` |

## Usage Example

```typescript
const res = await client.callTool({
  name: "get_company_news",
  arguments: {
    query: "MMM",
    sentiment: "positive",
    days: 7,
    limit: 5
  }
});
```

## File Location

`app/mcp/tools/get-company-news-tool.ts`
