---
filename: search-companies-tool.ts
name: search_companies
title: Search Companies
description: Fuzzy search for companies (quick lookup tool), returns concise info. Use symbol to call get_company_info for full details
inputSchema:
  - name: query
    type: string
    required: true
    describe: Search query (symbol, short name, or long name)
  - name: sector
    type: string
    required: false
    describe: Filter by sector
  - name: industry
    type: string
    required: false
    describe: Filter by industry
  - name: limit
    type: number
    required: false
    default: 5
    describe: Maximum number of results (1-20)
---

# search_companies

Fuzzy search for companies (quick lookup tool), returns concise info.

## Tool Information

| Field | Value |
|-------|-------|
| Name | `search_companies` |
| Title | Search Companies |
| Description | Fuzzy search for companies (quick lookup tool), returns concise info. Use symbol to call get_company_info for full details. |

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query (symbol, short name, or long name) |
| `sector` | string | No | - | Filter by sector |
| `industry` | string | No | - | Filter by industry |
| `limit` | number | No | 5 | Maximum number of results (1-20) |

## Input Schema

```typescript
{
  query: z.string().min(1),
  sector: z.string().optional(),
  industry: z.string().optional(),
  limit: z.number().int().min(1).max(20).default(5),
}
```

## Database

**Table**: `company_info`

**Columns**: `symbol`, `shortName`, `longName`, `sector`, `industry`

## Query Logic

1. Search pattern is wrapped with `%query%` for partial matching
2. Uses `ilike` for case-insensitive search on `symbol`, `shortName`, `longName`, `sector`, `industry`
3. Optional `sector` filter using `ilike`
4. Optional `industry` filter using `ilike`
5. Results limited to `limit` parameter

## Response

```typescript
{
  companies: [
    {
      symbol: "AAPL",
      shortName: "Apple Inc.",
      longName: "Apple Inc.",
      sector: "Technology",
      industry: "Consumer Electronics"
    }
  ],
  prompt: "Which company would you like to query?"
}
```

## Error Responses

| Scenario | Response |
|----------|----------|
| Database error | `Error searching companies: {error.message}` |
| No results | `No companies found` |

## Usage Example

```typescript
const res = await client.callTool({
  name: "search_companies",
  arguments: {
    query: "Apple",
    sector: "Technology",
    limit: 10
  }
});
```

## File Location

`app/mcp/tools/search-companies-tool.ts`
