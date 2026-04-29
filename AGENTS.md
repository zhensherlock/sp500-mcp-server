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
| `pnpm lint` | ESLint (flat config in `eslint.config.js`) |
| `pnpm test` | Vitest (tests require dev server running at `localhost:3000`) |
| `pnpm coverage` | Vitest with HTML coverage report |

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
tests/tools/                 ← Vitest tests (require dev server at localhost:3000)
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
4. Add a test in `tests/tools/`

## Important Notes
- **`.env` is gitignored** — never commit secrets
- Supabase client is **eagerly initialized** on import at `app/[transport]/utils/supabase.ts:20` — server will throw immediately if `SUPABASE_URL` or `SUPABASE_ANON_KEY` env vars are missing. Importing this module is the trigger.
- Tests connect to `localhost:3000/mcp` via `vitest.setup.ts` — run `pnpm dev` before `pnpm test`
- `maxDuration` defaults to 60, configurable via `MCP_MAX_DURATION` env var
- SSE is enabled by default (`disableSse: false`); requires Redis at `REDIS_URL` for production SSE
- For Vercel: requires Fluid compute; set `maxDuration: 800` in `route.ts` for Pro/Enterprise

## Commit Convention
This repo uses [Conventional Commits](https://www.conventionalcommits.org/). Husky runs `commitlint` on every commit via the `commit-msg` hook. Format: `type(scope): description` (e.g., `fix(mcp): resolve symbol resolution bug`).
