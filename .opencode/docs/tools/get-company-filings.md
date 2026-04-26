---
filename: get-company-filings-tool.ts
name: get_company_filings
title: Get Company Filings
description: Get SEC filings history for a company, supports filtering by symbol, date range, and filing type
inputSchema:
  - name: query
    type: string
    required: true
    describe: Search query (symbol, short name, or long name)
  - name: filing_type
    type: string
    required: false
    describe: Filter by filing type (e.g., 10-K, 10-Q, 8-K, PRE 14A, DEF 14A)
  - name: start_date
    type: string
    required: false
    describe: Filter filings from this date (YYYY-MM-DD)
  - name: end_date
    type: string
    required: false
    describe: Filter filings until this date (YYYY-MM-DD)
  - name: limit
    type: number
    required: false
    default: 20
    describe: Maximum number of filings to return (1-100)
---

# get_company_filings

Get SEC filings history for a company, supports filtering by symbol, date range, and filing type.

## Tool Information

| Field | Value |
|-------|-------|
| Name | `get_company_filings` |
| Title | Get Company Filings |
| Description | Get SEC filings history for a company, supports filtering by symbol, date range, and filing type. |

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query (symbol, short name, or long name) |
| `filing_type` | string | No | - | Filter by filing type (e.g., 10-K, 10-Q, 8-K, PRE 14A, DEF 14A) |
| `start_date` | string | No | - | Filter filings from this date (YYYY-MM-DD) |
| `end_date` | string | No | - | Filter filings until this date (YYYY-MM-DD) |
| `limit` | number | No | 20 | Maximum number of filings to return (1-100) |

## Input Schema

```typescript
{
  query: z.string().min(1),
  filing_type?: z.string().optional(),
  start_date?: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date?: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit?: z.number().int().min(1).max(100).default(20),
}
```

## Database

**Table**: `company_filings`

**Columns**: `id`, `symbol`, `filing_date`, `filing_type`, `title`, `edgarUrl`

## Query Logic

1. Resolve `query` to a stock symbol using `getCompanySymbol` utility (from `@/app/[transport]/utils`)
2. Filter by `symbol` using `.eq("symbol", symbol)`
3. Optional `filing_type` filter using `.ilike()` (case-insensitive partial match)
4. Optional `start_date` filter using `.gte("filing_date", start_date)`
5. Optional `end_date` filter using `.lte("filing_date", end_date)`
6. Order by `filing_date` descending (most recent first) using `.order("filing_date", { ascending: false })`
7. Results limited to `limit` parameter (default 20) using `.limit(limit)`

## Response

```typescript
{
  symbol: "AAPL",
  filings: [
    {
      filing_date: "2026-03-20",
      filing_type: "8-K",
      title: "Corporate Changes & Voting Matters",
      edgarUrl: "https://finance.yahoo.com/sec-filing/A/0001193125-26-117614_1090872"
    },
    {
      filing_date: "2026-03-06",
      filing_type: "8-K",
      title: "Corporate Changes & Voting Matters",
      edgarUrl: "https://finance.yahoo.com/sec-filing/A/0001193125-26-096487_1090872"
    }
  ]
}
```

## Error Responses

| Scenario | Response |
|----------|----------|
| Company not found | `Company not found` (from getCompanySymbol) |
| No filings found | `No filings found for {symbol} with {filters}. Try adjusting the date range or filing type.` |

## Usage Example

```typescript
const res = await client.callTool({
  name: "get_company_filings",
  arguments: {
    query: "AAPL",
    filing_type: "10-K",
    start_date: "2024-01-01",
    limit: 10
  }
});
```

## File Location

`app/[transport]/tools/get-company-filings-tool.ts`
