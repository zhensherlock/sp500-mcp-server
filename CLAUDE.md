# CLAUDE.md

## Stack
- Next.js 15 (App Router), React 19, TypeScript (strict mode)
- MCP server via `mcp-handler` — route at `app/[transport]/route.ts` (dynamic segment)
- Supabase client singleton at `app/[transport]/utils/supabase.ts`
- Package manager: **pnpm**

## Developer Commands
- `pnpm dev` — Start Next.js dev server
- `pnpm build` — Production build
- `pnpm start` — Start production server
- `pnpm type-check` — `tsc --noEmit`
- `pnpm lint` — ESLint (flat config in `eslint.config.mjs`)

## Architecture
```
app/
  [transport]/               ← MCP endpoint (dynamic [transport] segment)
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
  test-streamable-http-client.mjs  ← Connects to /mcp endpoint
```

## MCP Tools (4 total)
| Tool | Description |
|---|---|
| `get_company_info` | Company basics, financials, leadership, address, business summary |
| `get_company_news` | Recent news with sentiment analysis |
| `get_company_officers` | Executive officers and compensation |
| `get_company_filings` | SEC filings history (10-K, 10-Q, 8-K, etc.) |

**Note:** `search_companies` is an internal utility, NOT an exposed MCP tool.

## Adding a New Tool
1. Create `app/[transport]/tools/your-tool-name-tool.ts` — export `registerYourToolNameTool(mcpServer)`
2. Add export to `app/[transport]/tools/index.ts`
3. Import and call in `app/[transport]/route.ts`

## Critical Notes
- **`.env` is gitignored** — never commit secrets
- Supabase client is **eagerly initialized** on import (`supabase.ts:20`) — server throws immediately if env vars missing
- No test framework; manual testing via `node scripts/test-streamable-http-client.mjs [origin]`
- `maxDuration` defaults to 60, configurable via `MCP_MAX_DURATION` env var
- SSE enabled by default (`disableSse: false`); requires Redis at `REDIS_URL` for production SSE
- Vercel: requires Fluid compute; set `maxDuration: 800` in `route.ts` for Pro/Enterprise

## Commit Convention
[Conventional Commits](https://www.conventionalcommits.org/). Husky runs `commitlint` on `commit-msg` hook. Format: `type(scope): description`
