# AGENTS.md - apps/web

## Scope

- Next.js 16 App Router package for the public site, MCP server, web tool tester, and proxy routes.
- Also follow the root `AGENTS.md`; this file only adds `apps/web`-specific wiring.
- Package-local `@/*` imports resolve from `apps/web`; shared UI comes from `@workspace/ui/*` and is transpiled by `next.config.ts`.

## Commands

- Dev this app: `pnpm --filter @apps/web dev` (serves Next on `localhost:3000`).
- Build/type-check this app: `pnpm --filter @apps/web build`, `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`.
- Lint is root-only: `pnpm lint`.
- MCP integration tests must run from the repo root after Next is serving `localhost:3000`: `pnpm vitest run apps/web/tests/tools/<file>.test.ts`.

## MCP Server

- MCP entrypoint is `app/[transport]/route.ts`; it registers tools from `app/[transport]/tools/index.ts` and configures `basePath: '/'`, `disableSse: false`, `maxDuration`, and `redisUrl`.
- Local callers and the web tool tester use Streamable HTTP at `/mcp`; do not revive old `/sse` assumptions in tests or proxies.
- Tool modules import the eager `supabase` export from `app/[transport]/utils/supabase.ts`; missing `SUPABASE_URL` or `SUPABASE_ANON_KEY` throws during import.
- User-facing tools resolve `query` through `getCompanySymbol`; clients with elicitation choose a company, clients without it get the first search match.

## Tool Changes

- Add tools under `app/[transport]/tools/<name>-tool.ts`, export them from `tools/index.ts`, and call `register<Name>Tool(server)` in `route.ts`.
- Keep tool responses as MCP text content with `text` containing JSON, or a short error/no-results message; the embedded app parser depends on this shape.
- Update `app/tools/data.ts` when a tool is added or its inputs/return shape change; `app/api/tools/call/route.ts` POSTs JSON-RPC to `/mcp` for that tool tester.
- Each exposed tool should attach `_meta.ui.resourceUri` and call `registerHtmlAppResource`; matching HTML must exist in `../web-app/dist`.
- Add or update the matching integration test in `tests/tools/`; these tests use a real MCP client pointed at `http://localhost:3000/mcp`.

## Local Gotchas

- Rebuild embedded MCP App HTML with `pnpm --filter @apps/web-app build` before testing resource reads after `apps/web-app` changes.
- `/api/logo/*` proxies Logo.dev and requires `LOGO_DEV_TOKEN`; avoid passing user-supplied `token` query params through.
- `postcss.config.js` re-exports `@workspace/ui/postcss.config`; global Tailwind tokens live in `packages/ui/src/styles/globals.css`.
