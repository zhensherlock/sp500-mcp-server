# S&P 500 A2A demo

A local A2A 1.0 agent that builds short company briefs using S&P 500 MCP data. It uses non-streaming JSON-RPC over HTTP and listens on `127.0.0.1:4100`. Tasks are stored in memory and reset when the server restarts.

## Run the demo

Use Node 24.11 or later in the Node 24 release line and pnpm. Run `pnpm dev` from the workspace root to start both the MCP and A2A servers. For separate terminals, run these commands.

```sh
pnpm --filter @apps/web dev
pnpm --filter @apps/a2a dev
```

The MCP URL defaults to `http://localhost:3000/mcp`. Set `SP500_MCP_URL` before starting the agent to point it at another instance of the project’s MCP endpoint. A local MCP server needs its usual `SUPABASE_URL` and `SUPABASE_ANON_KEY` configuration.

For natural-language requests, set `OPENAI_API_KEY`. The extractor uses `OPENAI_MODEL` (default `gpt-6-luna`) and supports `OPENAI_PROXY_URL` for model requests. Outside production, the agent can reuse these three settings from the web app's `.env` and `.env.local` files. Environment variables take precedence. Direct company names, tickers, and listed aliases work without a model key.

Development watches the TypeScript sources and rebuilds both entries. The first successful build starts the server on port 4100, then launches A2A Inspector on port 5174 with `--no-open`. Open the full access URL printed by Inspector in the terminal. Later builds restart only the A2A server, so you can keep using the same Inspector tab. Stopping `pnpm dev` closes both processes. After starting it again, use the newly printed access URL in your existing tab to start a new Inspector session.

Install [A2A Inspector v1.0.0-alpha.2](https://github.com/a2aproject/a2a-inspector/releases/tag/v1.0.0-alpha.2) and put `a2a-inspector` on your `PATH`. If it is missing, the development server still starts.

To run a single build and start the resulting server, use these commands.

```sh
pnpm --filter @apps/a2a build
pnpm --filter @apps/a2a start
```

`pnpm --filter @apps/a2a demo:server` runs those two steps together. After the server starts, run the built client in a second terminal.

```sh
pnpm --filter @apps/a2a demo:client
```

In Inspector, leave **Stream** unchecked. Start each example as a new task and reply in the same chat when the agent asks for input.

| Send                       | Result                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `XOM`                      | Completes with Exxon's company brief.                                                                |
| `查询 apple 公司简报`      | Looks up Apple and returns the company brief for AAPL.                                               |
| `帮我看一下苹果公司的简报` | Extracts 苹果公司 and uses its verified alias, AAPL.                                                 |
| `Bank`, then `BAC`         | Pauses with a list of tickers. The choice resumes the same task and returns Bank of America's brief. |
| `Aple`, then `AAPL`        | Pauses and asks for a new company name or ticker. The corrected ticker completes the same task.      |

The agent first tries `get_company_info` with the input or a verified alias. If there is no match, the configured model extracts a company name or ticker from the user's text and the agent validates it with the same tool. After confirming a ticker, the agent calls `get_company_financials` and `get_company_news` in parallel. The brief includes the company and its industry, revenue and net income for the latest available annual period, and up to three recent headlines from the MCP data with their publication dates. A missing or unavailable section is marked in the brief. The Artifact includes the readable brief and structured data with unrounded financial figures and news URLs when available.

The CLI runs the examples, checks that each follow-up keeps the original task and context IDs, and calls `GetTask` to read and print Bank of America's brief.

Use curl to inspect the Agent Card.

```sh
curl http://127.0.0.1:4100/.well-known/agent-card.json
```

## Vercel Preview

Import the repository as a separate Express project with Root Directory `apps/a2a` and Node.js 24.x. Enable Vercel system environment variables so the Agent Card advertises the current deployment's HTTPS URL. Set `SP500_MCP_URL` to the full `/mcp` URL of a reachable Web deployment from this branch for company lookup and natural-language tests. Set the Web Preview's `SP500_A2A_URL` to the A2A deployment origin.

For an initial deployment smoke test, send `XOM` with blocking `SendMessage` to verify the completed brief in one request. The current task store lives in memory, so polling and company selection across Vercel instances require shared task storage.
