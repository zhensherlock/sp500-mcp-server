# AGENTS.md - sp500-mcp-server

## Repo Shape

- pnpm `10.33.4` workspace on Node 22 (`.nvmrc`) with Turbo over `apps/*`: main Next.js app in `apps/web`, embedded MCP App HTML in `apps/web-app`, HyperFrames promo video project in `apps/promo-video`, shared shadcn/Tailwind primitives in `packages/ui`.
- Nested `AGENTS.md` files in `apps/web`, `apps/web-app`, `apps/promo-video`, and `packages/ui` contain scoped instructions; read the nearest one before editing there.
- MCP server entrypoint is `apps/web/app/[transport]/route.ts`; route config uses `basePath: '/'`, `disableSse: false`, and local tests/proxy call Streamable HTTP at `/mcp` despite older README wording around `/sse`.
- `apps/web-app` builds one single-file HTML resource per `src/pages/*` into `apps/web-app/dist/*.html`; `apps/web/app/[transport]/tools/app-resource.ts` reads those files via `process.cwd() + '../web-app/dist'`.
- `apps/web-app/dist` is gitignored generated output. Rebuild it locally before testing MCP App resource reads; do not hand-edit generated HTML.
- `apps/promo-video` is a HyperFrames HTML video composition package. Source lives in `index.html`, visual direction in `DESIGN.md`, storyboard in `storyboard.md`, reusable media under `assets/`, and generated render output under `renders/`.

## Commands

- Install: `pnpm install`
- Dev all apps: `pnpm dev`; focused Next app: `pnpm --filter @apps/web dev`; focused MCP App UI: `pnpm --filter @apps/web-app dev` (proxies `/mcp` and `/api/logo` to `localhost:3000`); promo video preview: `pnpm --filter @apps/promo-video dev` (HyperFrames Studio on port `6002`).
- Build web + embedded app: `pnpm build` (root script excludes `@apps/promo-video`); rebuild embedded HTML only: `pnpm --filter @apps/web-app build`; render promo video: `pnpm render:promo` or `pnpm --filter @apps/promo-video render`.
- Production start: `pnpm start` (filtered to `apps/web`).
- Lint/format check: `pnpm lint` (ESLint flat config includes `prettier/prettier`).
- Type check app packages: `pnpm type-check`. If editing shared UI, also run `pnpm exec tsc -p packages/ui/tsconfig.json --noEmit`; root `type-check` only filters `apps/*`.
- Direct type checks: `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`, `pnpm exec tsc -p apps/web-app/tsconfig.json --noEmit`.
- Tests are integration tests: start Next on `localhost:3000` first (`pnpm --filter @apps/web dev`, or `pnpm dev` for all apps), then run `pnpm test`; single file: `pnpm vitest run apps/web/tests/tools/get-company-info-tool.test.ts`; coverage: `pnpm coverage`.
- Promo video checks: `pnpm check:promo` runs HyperFrames `lint`, `validate`, and `inspect`; expect `timeline_track_too_dense` as a non-blocking warning while the promo remains a single composition file.

## Runtime And Test Gotchas

- `.env*` is gitignored. `apps/web/app/[transport]/utils/supabase.ts` eagerly exports `supabase = getSupabaseClient()`, so missing `SUPABASE_URL` or `SUPABASE_ANON_KEY` throws during import.
- Vitest setup connects a real MCP client to `http://localhost:3000/mcp`; tests fail without the dev server and real Supabase data.
- Turbo forwards these env vars to app tasks: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MCP_MAX_DURATION`, `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `LOGO_DEV_TOKEN`.
- `REDIS_URL` is used by `mcp-handler` for production SSE; `LOGO_DEV_TOKEN` is only required for the `/api/logo/*` proxy.

## MCP Tool Wiring

- Exposed tools are `get_company_info`, `get_company_news`, `get_company_officers`, `get_company_filings`, `get_company_financials`, and `get_company_price_data`.
- `search_companies` is intentionally internal. User-facing tools resolve the `query` through `getCompanySymbol`, which elicits a company choice when the MCP client supports elicitation and otherwise uses the first match.
- Tool files live in `apps/web/app/[transport]/tools/<name>-tool.ts`, use Zod input schemas, and return MCP text content whose `text` is a JSON string or a short error/no-results message.
- To add a tool, export `register<Name>Tool` from `tools/index.ts`, call it in `route.ts`, add/update `apps/web/app/tools/data.ts`, and add an integration test under `apps/web/tests/tools/`.
- Every exposed tool should register a matching MCP App resource with `_meta.ui.resourceUri`; add the page in `apps/web-app/src/pages`, then run `pnpm --filter @apps/web-app build`.

## App/UI Boundaries

- `apps/web` imports local code through `@/*` from the app root and transpiles `@workspace/ui` in `next.config.ts`.
- `apps/web-app` imports local code through `@/*` from `src` and shared UI through `@workspace/ui/*`; its Vite dev server proxies MCP/API calls to the Next app.
- Shared reusable UI primitives belong in `packages/ui/src/components`; Next-specific components in `apps/web/components`; embedded MCP App UI in `apps/web-app/src/components`.
- shadcn configs exist in `apps/web/components.json` and `packages/ui/components.json`; both use the `radix-nova` style and lucide icons.

## Workflow Notes

- Commit messages are Conventional Commits; Husky runs `commitlint` with allowed types `feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|release` and no subject-case rule.
- Husky `pre-commit` runs `npx lint-staged`; lint-staged only targets `{packages,apps}/**/*.{js,ts,tsx}`.
- `.opencode/agents/mcp-tool-developer.md` has a fuller MCP tool template, but its paths omit the current `apps/web` workspace prefix.
- HyperFrames generated output (`apps/*/renders/`, `apps/*/.thumbnails/`, `apps/*/.waveform-cache/`) is gitignored. Keep rendered promo MP4s local unless explicitly asked to commit or publish them.
