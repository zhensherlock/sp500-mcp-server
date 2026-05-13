# AGENTS.md - apps/web-app

## Scope

- Vite React package that builds embedded MCP App pages into single-file HTML resources consumed by `apps/web`.
- Package-local `@/*` imports resolve from `apps/web-app/src`; shared primitives and CSS come from `@workspace/ui/*`.

## Commands

- Dev this app: `pnpm --filter @apps/web-app dev`.
- Build embedded HTML resources: `pnpm --filter @apps/web-app build`.
- Type-check this app: `pnpm exec tsc -p apps/web-app/tsconfig.json --noEmit`.
- For live MCP calls in dev, also run the Next app on `localhost:3000`; Vite proxies `/mcp` and `/api/logo` there.

## Build Model

- `scripts/build-pages.js` loops over every `src/pages/*.{ts,tsx}` and invokes Vite once per page with `MCP_APP_PAGE`.
- `vite.config.ts` creates missing root HTML entry files like `company-info.html`, then emits `dist/<page>.html` with `vite-plugin-singlefile`.
- `dist/` is gitignored generated output; do not edit it manually, and rebuild it before testing MCP App resources from `apps/web`.
- Root `*.html` entry files are tracked inputs for Vite; only create/update them intentionally when adding a page.

## MCP App Pages

- Keep one page per tool in `src/pages`; each page should import `@workspace/ui/globals.css` before rendering its app component.
- Tool-specific app components use `components/tool-app/use-mcp-tool-app.ts`, which receives `ontoolinput`, `ontoolresult`, host context, and errors from `@modelcontextprotocol/ext-apps/react`.
- Tool result parsers should go through `components/tool-app/parse-tool-result.ts`; it accepts `structuredContent` first, then JSON in the first text content block.
- The debugger path uses `components/debugger/mcp-client.ts` and Streamable HTTP at `/mcp`; keep it aligned with `apps/web/app/[transport]/route.ts`.

## Adding A Tool UI

- Add `src/pages/<page>.tsx`, a matching component folder under `src/components/<tool>/`, parser/types, and a view component.
- The server tool in `apps/web` must register the same `ui://sp500/<page>.html` resource and file name.
- After page changes, run `pnpm --filter @apps/web-app build`; then run the relevant `apps/web` integration test or manual MCP resource check.
