# AGENTS.md - sp500-mcp-server

## What This Repo Is
- pnpm 10 workspace on Node 22 (`.nvmrc`); main Next.js package is `apps/web`, MCP App HTML package is `apps/web-app`, shared shadcn/Tailwind UI package is `packages/ui`.
- Root `pnpm dev|build|type-check` use Turbo over `apps/*`; `pnpm start` is filtered to `apps/web`; root `lint`, `test`, and `coverage` run from the repo root.
- Next.js App Router MCP endpoint is `apps/web/app/[transport]/route.ts`; with `basePath: '/'`, tests and proxy call it at `/mcp`.

## Commands
- Install: `pnpm install`
- Dev server: `pnpm dev`; focused Next app only: `pnpm --filter @apps/web dev`; focused MCP App UI only: `pnpm --filter @apps/web-app dev` (proxies `/mcp` to `localhost:3000`).
- Build all app packages: `pnpm build`; build just embedded MCP App HTML: `pnpm --filter @apps/web-app build`.
- Lint/format check: `pnpm lint` (ESLint flat config also enforces Prettier)
- Type check app packages: `pnpm type-check`; direct checks: `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`, `pnpm exec tsc -p apps/web-app/tsconfig.json --noEmit`, `pnpm exec tsc -p packages/ui/tsconfig.json --noEmit`.
- All tests: start `pnpm dev` first, then run `pnpm test`
- Single test file: start `pnpm dev`, then `pnpm vitest run apps/web/tests/tools/get-company-info-tool.test.ts`
- Coverage: start `pnpm dev`, then `pnpm coverage` (HTML reporter)

## Runtime/Test Gotchas
- `.env*` is gitignored. Server import of `apps/web/app/[transport]/utils/supabase.ts` eagerly creates `supabase`, so missing `SUPABASE_URL` or `SUPABASE_ANON_KEY` throws before tools run.
- Vitest setup in `apps/web/vitest.setup.ts` connects a real MCP client to `http://localhost:3000/mcp`; tests are integration tests and fail if the dev server or Supabase data is unavailable.
- Turbo passes these env vars to app tasks: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MCP_MAX_DURATION`, `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- SSE is enabled in the MCP handler (`disableSse: false`); production SSE needs Redis via `REDIS_URL`.
- MCP App resources are loaded from `apps/web-app/dist` by `apps/web/app/[transport]/tools/app-resource.ts` using `process.cwd() + '../web-app/dist'`; run `pnpm --filter @apps/web-app build` before testing resource reads if `dist` is stale or missing.

## MCP Tool Wiring
- Current exposed tools are `get_company_info`, `get_company_news`, `get_company_officers`, and `get_company_filings`.
- `search_companies` is intentionally internal; user queries resolve through `getCompanySymbol`, which may use MCP elicitation when the client supports it.
- To add a tool, create `apps/web/app/[transport]/tools/<name>-tool.ts`, export `register<Name>Tool(server)`, add it to `tools/index.ts`, call it in `route.ts`, and add an integration test under `apps/web/tests/tools/`.
- Tool files use Zod schemas, resolve company queries through `getCompanySymbol`, and return MCP text content with JSON strings; follow existing tool files before inventing a new response shape.
- Each exposed tool registers a matching MCP App resource with `_meta.ui.resourceUri`; add/update the corresponding page in `apps/web-app/src/pages` and rebuild `apps/web-app/dist`.

## App/UI Boundaries
- `apps/web` imports local app code through `@/*`; `apps/web-app` imports local code through `@/*` to `src`; shared UI exports come from `@workspace/ui/*`.
- `apps/web/next.config.ts` transpiles `@workspace/ui`; app PostCSS re-exports `@workspace/ui/postcss.config`.
- shadcn config exists in `apps/web/components.json` and `packages/ui/components.json`; put reusable primitives in `packages/ui/src/components`, Next-specific components in `apps/web/components`, and MCP App UI components in `apps/web-app/src/components`.

## Workflow Conventions
- Commit messages are Conventional Commits; Husky `commit-msg` runs `commitlint` with allowed types in `commitlint.config.js`.
- Husky `pre-commit` runs `npx lint-staged`; commit messages allow `feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|release` and do not enforce subject case.
- Keep generated/build output out of edits (`.next`, `.turbo`, coverage). `apps/web-app/dist/*.html` is generated but required by MCP App resource reads; update it intentionally when changing embedded app pages.
- Existing OpenCode helper docs live under `.opencode/`; `.opencode/agents/mcp-tool-developer.md` has a fuller MCP tool template, but its paths omit the current `apps/web` workspace prefix.
