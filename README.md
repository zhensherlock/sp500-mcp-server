# S&P 500 MCP Server

An MCP (Model Context Protocol) server that provides AI assistants with access to S&P 500 company data. Built on Next.js 15 and Supabase, it exposes tools for searching companies and retrieving detailed company information.

## Tools

| Tool | Description |
|---|---|
| `search_companies` | Fuzzy search for companies by symbol, name, sector, or industry |
| `get_company_info` | Get complete company basic info by symbol or company name |

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **MCP**: `mcp-handler` package — route at `app/mcp/`
- **Database**: Supabase (client at `app/mcp/utils/supabase.ts`)
- **Package manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm
- Supabase project with `company_info` table

### Local Development

1. Install dependencies:

```sh
pnpm install
```

2. Create a `.env` file with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the development server:

```sh
pnpm dev
```

### Other Commands

```sh
pnpm build        # Production build
pnpm type-check   # TypeScript type checking
pnpm lint         # ESLint
```

## Vercel Deployment

- Requires [Fluid compute](https://vercel.com/docs/functions/fluid-compute) enabled
- Set `maxDuration: 800` in `app/mcp/route.ts` for Vercel Pro/Enterprise accounts
- For SSE transport: requires Redis at `REDIS_URL` and `disableSse: false` in `app/mcp/route.ts`

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

[MIT](LICENSE) © MichaelSun
