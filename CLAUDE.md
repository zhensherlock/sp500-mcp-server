# CLAUDE.md - sp500-mcp-server

## What This Repo Is
- pnpm 10 workspace on Node 22 (`.nvmrc`); app package is `apps/web`, shared shadcn/Tailwind UI package is `packages/ui`.
- Root scripts use Turbo only for app lifecycle commands: `pnpm dev|build|start` run `apps/web`; root `lint`, `test`, and `coverage` run from the repo root.
- Next.js App Router MCP endpoint is `apps/web/app/[transport]/route.ts`; with `basePath: '/'`, tests and proxy call it at `/mcp`.

## Commands
- Install: `pnpm install`
- Dev server: `pnpm dev` or focused `pnpm --filter @apps/web dev`
- Build: `pnpm build`
- Lint/format check: `pnpm lint` (ESLint flat config also enforces Prettier)
- Type check app directly: `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`; for shared UI use `pnpm exec tsc -p packages/ui/tsconfig.json --noEmit`
- Avoid `pnpm type-check` until the script is fixed; it calls `tsc --noEmit` without a root `tsconfig.json` and exits with TypeScript help.
- All tests: start `pnpm dev` first, then run `pnpm test`
- Single test file: start `pnpm dev`, then `pnpm vitest run apps/web/tests/tools/get-company-info-tool.test.ts`
- Coverage: start `pnpm dev`, then `pnpm coverage` (HTML reporter)

## Runtime/Test Gotchas
- `.env*` is gitignored. Server import of `apps/web/app/[transport]/utils/supabase.ts` eagerly creates `supabase`, so missing `SUPABASE_URL` or `SUPABASE_ANON_KEY` throws before tools run.
- Vitest setup in `apps/web/vitest.setup.ts` connects a real MCP client to `http://localhost:3000/mcp`; tests are integration tests and fail if the dev server or Supabase data is unavailable.
- Turbo passes these env vars to app tasks: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MCP_MAX_DURATION`, `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- SSE is enabled in the MCP handler (`disableSse: false`); production SSE needs Redis via `REDIS_URL`.

## MCP Tool Wiring
- Current exposed tools are `get_company_info`, `get_company_news`, `get_company_officers`, and `get_company_filings`.
- `search_companies` is intentionally internal; user queries resolve through `getCompanySymbol`, which may use MCP elicitation when the client supports it.
- To add a tool, create `apps/web/app/[transport]/tools/<name>-tool.ts`, export `register<Name>Tool(server)`, add it to `tools/index.ts`, call it in `route.ts`, and add an integration test under `apps/web/tests/tools/`.
- Tool files use Zod schemas and return MCP text content with JSON strings; follow existing tool files before inventing a new response shape.

## App/UI Boundaries
- `apps/web` imports local app code through `@/*`; shared UI exports come from `@workspace/ui/*`.
- `apps/web/next.config.ts` transpiles `@workspace/ui`; app PostCSS re-exports `@workspace/ui/postcss.config`.
- shadcn config exists in both `apps/web/components.json` and `packages/ui/components.json`; put reusable primitives in `packages/ui/src/components`, app-specific components in `apps/web/components`.

## Workflow Conventions
- Commit messages are Conventional Commits; Husky `commit-msg` runs `commitlint` with allowed types in `commitlint.config.js`.
- Keep generated/build output out of edits (`.next`, `.turbo`, coverage). Do not commit `.env` files or secrets.
- Existing OpenCode helper docs live under `.opencode/`; `.opencode/agents/mcp-tool-developer.md` has a fuller MCP tool template, but some paths there omit the current `apps/web` workspace prefix.
