# AGENTS.md - sp500-mcp-server

## Stack
- Next.js 15 (App Router), React 19, TypeScript (strict mode)
- MCP server via `mcp-handler` — route at `app/mcp/`
- Supabase client singleton at `app/mcp/utils/supabase.ts` (reads `SUPABASE_URL`, `SUPABASE_ANON_KEY`)
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
app/mcp/
  route.ts          ← MCP endpoint (GET/POST/DELETE). StreamableHTTP transport; SSE disabled.
  tools/
    index.ts              ← Barrel export for tools
    search-companies-tool.ts
    get-company-info-tool.ts
    get-company-news-tool.ts
    get-company-officers-tool.ts
  utils/
    supabase.ts     ← Supabase singleton (lazy-init, throws if env vars missing)
scripts/
  test-streamable-http-client.mjs  ← Streams to /mcp endpoint (default: mcp-on-vercel.vercel.app)
```

**Adding a new tool:** Create a file in `app/mcp/tools/`, export from `tools/index.ts`, then register in `route.ts`'s handler callback.

**MCP endpoint:** Mounted at `/mcp` via Next.js directory-based routing.

## Important Notes
- **`.env` is gitignored** — never commit secrets
- No test framework; testing is manual via `node scripts/test-streamable-http-client.mjs [origin]`
- `maxDuration` defaults to 60, configurable via `MCP_MAX_DURATION` env var
- For Vercel: requires Fluid compute; SSE requires Redis at `REDIS_URL` and `disableSse: false` in `route.ts`
