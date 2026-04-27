# AGENTS.md - sp500-mcp-server

## Stack
- Next.js 15 (App Router), React 19, TypeScript (strict mode)
- MCP server via `mcp-handler` — route at `app/[transport]/route.ts` (dynamic segment `[transport]`)
- Supabase client singleton at `app/[transport]/utils/supabase.ts`
- Package manager: **pnpm**

## Developer Commands
| Command | Action |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm lint` | ESLint (flat config in `eslint.config.mjs`) |

## Architecture

```
app/
  [transport]/               ← MCP endpoint via dynamic route segment
    route.ts                 ← GET/POST/DELETE handler (StreamableHTTP, SSE enabled)
    tools/
      index.ts               ← Barrel export for tool registration functions
      get-company-info-tool.ts
      get-company-news-tool.ts
      get-company-officers-tool.ts
      get-company-filings-tool.ts
    utils/
      supabase.ts            ← Eagerly initializes Supabase client on import
      searchCompanies.ts     ← Internal symbol resolver (NOT an MCP tool)
      getCompanySymbol.ts    ← Resolves query string → stock symbol
      getSummary.ts
  api/tools/call/route.ts    ← HTTP proxy that forwards to /mcp
  tools/data.ts              ← Tool definitions for the docs website
scripts/
  test-streamable-http-client.mjs  ← Connects to /mcp endpoint (default: mcp-on-vercel.vercel.app)
```

## MCP Tools (4 total)
| Tool | Description |
|---|---|
| `get_company_info` | Company basics, financials, leadership, address, business summary |
| `get_company_news` | Recent news with sentiment analysis |
| `get_company_officers` | Executive officers and compensation |
| `get_company_filings` | SEC filings history (10-K, 10-Q, 8-K, etc.) |

**Note:** `search_companies` is an internal utility, NOT an exposed MCP tool. Symbol resolution is handled internally by `getCompanySymbol`.

## Adding a New Tool
1. Create `app/[transport]/tools/your-tool-name-tool.ts` — export a `registerYourToolNameTool(mcpServer)` function
2. Add the export to `app/[transport]/tools/index.ts`
3. Import and call the registration function in `app/[transport]/route.ts`

## Important Notes
- **`.env` is gitignored** — never commit secrets
- No test framework; testing is manual via `node scripts/test-streamable-http-client.mjs [origin]`
- Supabase client throws if `SUPABASE_URL` or `SUPABASE_ANON_KEY` env vars are missing
- `maxDuration` defaults to 60, configurable via `MCP_MAX_DURATION` env var
- SSE is enabled by default (`disableSse: false`); requires Redis at `REDIS_URL` for production SSE
- For Vercel: requires Fluid compute; set `maxDuration: 800` in `route.ts` for Pro/Enterprise
