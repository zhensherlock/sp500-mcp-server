# S&P 500 MCP Server

An MCP (Model Context Protocol) server and Next.js web app for querying S&P 500 company data from Supabase. It exposes MCP tools for company fundamentals, news sentiment, officers, and SEC filings, plus a web UI for browsing and testing those tools.

## Tools

| Tool | Description |
|---|---|
| `get_company_info` | Company basics, financials, leadership, address, and business summary |
| `get_company_news` | Recent company news with sentiment filtering |
| `get_company_officers` | Executive officers and compensation |
| `get_company_filings` | SEC filings history, with filing type and date filters |

`search_companies` is an internal symbol resolver, not an exposed MCP tool. User queries are resolved through `getCompanySymbol`.

## Tech Stack

- **Workspace**: pnpm 10 + Turborepo
- **Runtime**: Node 22 (`.nvmrc`)
- **App**: Next.js 15 App Router, React 19, TypeScript strict mode (`apps/web`)
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

3. Start the Next.js app:

```sh
pnpm dev
```

The web app runs on `http://localhost:3000`; the MCP endpoint is `http://localhost:3000/mcp`.

## Commands

```sh
pnpm dev        # Start apps/web via Turbo
pnpm build      # Production build for apps/web
pnpm start      # Start production server for apps/web
pnpm lint       # ESLint + Prettier rule checks
```

Type-check the packages directly:

```sh
pnpm exec tsc -p apps/web/tsconfig.json --noEmit
pnpm exec tsc -p packages/ui/tsconfig.json --noEmit
```

`pnpm type-check` currently calls `tsc --noEmit` without a root `tsconfig.json`, so it exits with TypeScript help instead of checking the app.

## Testing

Tests are integration tests that connect a real MCP client to `http://localhost:3000/mcp`, so start the dev server first:

```sh
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
packages/ui/
  src/components/               Shared shadcn UI primitives
  src/styles/globals.css        Shared Tailwind CSS
```

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
