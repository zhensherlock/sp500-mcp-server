---
filename: get-company-info-tool.ts
name: get_company_info
title: Get Company Info
description: Get complete company basic info, supports symbol and company name queries
inputSchema:
  - name: query
    type: string
    required: true
    describe: Search query (symbol, short name, or long name)
---

# get_company_info

Get complete company basic info, supports symbol and company name queries.

## Tool Information

| Field | Value |
|-------|-------|
| Name | `get_company_info` |
| Title | Get Company Info |
| Description | Get complete company basic info, supports symbol and company name queries. |

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (symbol, short name, or long name) |

## Input Schema

```typescript
{
  query: z.string().min(1),
}
```

## Database

**Table**: `company_info`

**Columns**: `symbol`, `shortName`, `longName`, `displayName`, `quoteType`, `address`, `city`, `zip`, `country`, `phone`, `website`, `irWebsite`, `sector`, `sectorKey`, `industry`, `industryKey`, `longBusinessSummary`, `fullTimeEmployees`

## Query Logic

1. Resolve `query` to a stock symbol via `getCompanySymbol` utility (reports not found via MCP if no match)
2. Query `company_info` by exact `symbol` match
3. Returns only the first match (`.single()`)

## Response

```typescript
{
  symbol: "AAPL",
  shortName: "Apple Inc.",
  longName: "Apple Inc.",
  displayName: "Apple Inc.",
  quoteType: "EQUITY",
  address: "One Apple Park Way",
  city: "Cupertino",
  zip: "95014",
  country: "United States",
  phone: "+1-408-996-1010",
  website: "https://www.apple.com",
  irWebsite: "https://investor.apple.com",
  sector: "Technology",
  sectorKey: "technology",
  industry: "Consumer Electronics",
  industryKey: "consumer-electronics",
  longBusinessSummary: "Apple Inc. designs, manufactures, and markets smartphones...",
  fullTimeEmployees: 164000
}
```

## Error Responses

| Scenario | Response |
|----------|----------|
| Company not found | `Company not found` (from getCompanySymbol) |

## Usage Example

```typescript
const res = await client.callTool({
  name: "get_company_info",
  arguments: {
    query: "AAPL"
  }
});
```

## File Location

`app/[transport]/tools/get-company-info-tool.ts`
