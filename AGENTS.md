# AGENTS.md - sp500-mcp-server

## Stack
- Next.js 15 (App Router), React 19, TypeScript (strict mode)
- MCP server via `mcp-handler` package — route at `app/mcp/`
- Supabase client at `app/mcp/utils/supabase.ts` (reads `SUPABASE_URL`, `SUPABASE_ANON_KEY` from env)
- Package manager: **pnpm** (pnpm-lock.yaml)

## Developer Commands
| Command | Action |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm type-check` | `tsc --noEmit` (no codegen) |
| `pnpm lint` | ESLint (extends `next/core-web-vitals`, flat config in `eslint.config.mjs`) |

## Architecture

```
app/mcp/
  route.ts          ← MCP endpoint (GET/POST/DELETE). Streamable HTTP transport; SSE disabled (hardcoded).
  tools/
    index.ts              ← Barrel export for tools
    search-companies-tool.ts
    get-company-info-tool.ts
    get-company-news-tool.ts
  utils/
    supabase.ts     ← Shared Supabase client (from env vars)
scripts/
  test-client.mjs                  ← SSE client (legacy, points at /sse)
  test-streamable-http-client.mjs  ← StreamableHTTP client (points at /mcp)
```

**Adding a new tool:** Create a file in `app/mcp/tools/` following the pattern of existing tools (e.g., `search-companies-tool.ts`), export from `tools/index.ts`, then register it in `route.ts`'s handler callback.

**MCP path:** The endpoint is mounted at `/mcp` (directory-based in Next.js App Router). Test client should hit `/mcp` (see `test-streamable-http-client.mjs`).

## Important Notes
- **`.env` is gitignored** but credentials were present at some point — never commit secrets
- No test framework is set up; testing is manual via the client scripts
- `maxDuration` defaults to 60, configurable via `MCP_MAX_DURATION` env var
- For Vercel deployment: requires Fluid compute; SSE requires Redis at `REDIS_URL` and `disableSse: false`
