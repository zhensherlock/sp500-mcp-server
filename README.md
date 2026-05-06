# S&P 500 MCP Server

An MCP (Model Context Protocol) server and Next.js web app for querying S&P 500 company data from Supabase. It exposes MCP tools for company fundamentals, news sentiment, officers, and SEC filings, plus a web UI and embedded MCP App resources for browsing and testing those tools.

## Tools

| Tool | Description |
|---|---|
| `get_company_info` | Company basics, financials, leadership, address, and business summary |
| `get_company_news` | Recent company news with sentiment filtering |
| `get_company_officers` | Executive officers and compensation |
| `get_company_filings` | SEC filings history, with filing type and date filters |

`search_companies` is an internal symbol resolver, not an exposed MCP tool. User queries are resolved through `getCompanySymbol`.

## Tech Stack

- **Workspace**: pnpm 10.33.3 + Turborepo
- **Runtime**: Node 22 (`.nvmrc`)
- **Web app**: Next.js 16 App Router, React 19, TypeScript strict mode (`apps/web`)
- **MCP Apps**: Vite single-file React pages built from `apps/web-app` and served as tool UI resources
- **MCP**: `mcp-handler` at `apps/web/app/[transport]/route.ts`; `/mcp` is the active endpoint
- **Database**: Supabase client at `apps/web/app/[transport]/utils/supabase.ts`
- **UI**: shared shadcn/Tailwind primitives in `packages/ui`

## Getting Started

### Prerequisites

- Node.js 22
- pnpm 10
- Supabase project with the S&P 500 data tables used by the tools

### Local Development

1. Install dependencies:

```sh
pnpm install
```

2. Create a local env file with Supabase credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MCP_MAX_DURATION=60
REDIS_URL=your_redis_url
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are required. `REDIS_URL` is only needed for production SSE.

3. Build the embedded MCP App HTML resources:

```sh
pnpm --filter @apps/web-app build
```

4. Start the apps:

```sh
pnpm dev
```

The Next.js web app runs on `http://localhost:3000`; the MCP endpoint is `http://localhost:3000/mcp`. The `apps/web-app` dev server proxies `/mcp` to port 3000 when run separately.

## Commands

```sh
pnpm dev        # Start apps/* dev tasks via Turbo
pnpm build      # Build apps/web and apps/web-app via Turbo
pnpm start      # Start production server for apps/web
pnpm type-check # Type-check apps/web and apps/web-app
pnpm lint       # ESLint + Prettier rule checks
```

Focused commands:

```sh
pnpm --filter @apps/web dev
pnpm --filter @apps/web-app dev
pnpm --filter @apps/web-app build
pnpm exec tsc -p apps/web/tsconfig.json --noEmit
pnpm exec tsc -p apps/web-app/tsconfig.json --noEmit
pnpm exec tsc -p packages/ui/tsconfig.json --noEmit
```

## Testing

Tests are integration tests that connect a real MCP client to `http://localhost:3000/mcp`, so start the dev server first:

```sh
pnpm --filter @apps/web-app build
pnpm dev
pnpm test
```

Run a single tool test:

```sh
pnpm vitest run apps/web/tests/tools/get-company-info-tool.test.ts
```

Generate coverage:

```sh
pnpm coverage
```

## Project Layout

```text
apps/web/
  app/[transport]/route.ts      MCP GET/POST/DELETE handler
  app/[transport]/tools/        MCP tool registrations
  app/[transport]/utils/        Supabase, symbol resolution, summaries
  app/api/tools/call/route.ts   HTTP proxy for the web tool tester
  app/tools/                    Tool catalog page
  components/                   App-specific UI
  tests/tools/                  MCP integration tests
apps/web-app/
  src/pages/                    Embedded MCP App pages, one per tool
  src/components/               MCP App UI components
  scripts/build-pages.js        Builds each page into dist/*.html
  dist/                         Generated single-file HTML resources
packages/ui/
  src/components/               Shared shadcn UI primitives
  src/styles/globals.css        Shared Tailwind CSS
```

`apps/web/app/[transport]/tools/app-resource.ts` reads generated HTML from `apps/web-app/dist`, so rebuild `apps/web-app` after changing embedded MCP App pages.

## Vercel Deployment

- Requires [Fluid compute](https://vercel.com/docs/functions/fluid-compute)
- `MCP_MAX_DURATION` defaults to `60`; set a higher duration for long-running production calls when your Vercel plan supports it
- SSE is enabled (`disableSse: false`); production SSE requires Redis via `REDIS_URL`

## Docs

Full guides and examples: https://sp500-mcp.vercel.app/

## Contributing

Feel free to dive in! [Open an issue](https://github.com/zhensherlock/sp500-mcp-server/issues/new/choose) or submit PRs.

Standard Readme follows the [Contributor Covenant](http://contributor-covenant.org/version/1/3/0/) Code of Conduct.

### Contributors

This project exists thanks to all the people who contribute.

<a href="https://github.com/zhensherlock/sp500-mcp-server/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=zhensherlock/sp500-mcp-server" />
</a>

## License

[GNU Affero General Public License v3.0](LICENSE) © MichaelSun
