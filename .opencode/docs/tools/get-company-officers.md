---
filename: get-company-officers-tool.ts
name: get_company_officers
title: Get Company Officers
description: Get company executive officers and their compensation info, supports filtering by symbol
inputSchema:
  - name: query
    type: string
    required: true
    describe: Search query (symbol, short name, or long name)
  - name: limit
    type: number
    required: false
    default: 20
    describe: Maximum number of officers to return (1-50)
---

# get_company_officers

Get company executive officers and their compensation info, supports filtering by symbol.

## Tool Information

| Field | Value |
|-------|-------|
| Name | `get_company_officers` |
| Title | Get Company Officers |
| Description | Get company executive officers and their compensation info, supports filtering by symbol. |

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query (symbol, short name, or long name) |
| `limit` | number | No | 20 | Maximum number of officers to return (1-50) |

## Input Schema

```typescript
{
  query: z.string().min(1),
  limit?: z.number().int().min(1).max(50).default(20),
}
```

## Database

**Table**: `company_officers`

**Columns**: `id`, `symbol`, `name`, `age`, `title`, `totalPay`

## Query Logic

1. Resolve `query` to a stock symbol via `getCompanySymbol` utility (reports not found via MCP if no match)
2. Filter officers by `symbol`
3. Order by `totalPay` descending (higher paid executives first)
4. Limit results to `limit` rows (default 20)

## Response

```typescript
{
  symbol: "AAPL",
  officers: [
    {
      name: "Mr. Timothy D. Cook",
      age: 64,
      title: "CEO & Director",
      totalPay: 16759518
    },
    {
      name: "Ms. Deirdre O'Brien",
      age: 58,
      title: "Senior Vice President of Retail & People",
      totalPay: 5037867
    }
  ]
}
```

## Error Responses

| Scenario | Response |
|----------|----------|
| Company not found | `Company not found` (from getCompanySymbol) |
| No officers found | `No officers found for {symbol}.` |

## Usage Example

```typescript
const res = await client.callTool({
  name: "get_company_officers",
  arguments: {
    query: "AAPL",
    limit: 10
  }
});
```

## File Location

`app/[transport]/tools/get-company-officers-tool.ts`
