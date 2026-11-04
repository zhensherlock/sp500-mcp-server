# Agent playground

The English research workspace lives at `/playground` in this Next.js app. It uses the published `eve` package, its own project tools, and AI SDK's MCP Apps renderer. There is no Eve fork or separate frontend project.

## Local setup

Use Node 24 (`nvm use`) and `pnpm install`. Add these server variables to `apps/web/.env.local`, alongside the existing Supabase configuration:

```dotenv
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-6-luna
PLAYGROUND_SESSION_SECRET=your-long-random-secret
```

`OPENAI_MODEL` is optional. The model must support tool calling and the configured reasoning effort. The key is used directly with OpenAI, without AI Gateway. Set a stable `PLAYGROUND_SESSION_SECRET` to preserve visitor identity across model key rotations; the API key is the fallback signing secret.

If local requests to OpenAI fail with `ECONNRESET` while the browser works through a system proxy, configure the model's proxy explicitly. Node does not automatically inherit macOS system proxy settings:

```dotenv
OPENAI_PROXY_URL=http://127.0.0.1:7890
```

Use the actual HTTP/HTTPS proxy address configured on your machine. This setting applies only to OpenAI model requests; local MCP and workflow requests keep their normal connection. Restart the dev server after changing environment variables. Omit a local proxy address in Vercel deployments.

```sh
pnpm --filter @apps/web-app build
pnpm --filter @apps/web dev
```

Open `http://localhost:3000/playground`. When using another port, set `SP500_MCP_URL` to that server's `/mcp` endpoint before starting Next. The server also accepts a configured remote MCP endpoint through this variable; visitors cannot change it.

## Execution and display

- `agent/agent.ts` chooses the direct OpenAI model, medium reasoning, and a per-session usage window of 200,000 new input tokens or 20,000 output tokens. There is no fixed tool-call count cutoff. Eve surfaces its budget interaction when the window is reached.
- Six `defineWorkflowTool` wrappers call the existing MCP endpoint. Independent model-selected calls can run together. Company elicitation is saved as plain workflow data, displayed through `ctx.ask`, and resumed using the selected enum value.
- `toModelOutput` sends the model the MCP data. The full tool result and App resource URI remain in Eve's events for the frontend.
- The UI shows streamed Markdown, model-provided reasoning summaries when available, tool states, inputs, raw results, and interactive MCP Apps. A missing reasoning summary produces no invented thinking text.
- Reasoning follows shadcn's `Trace` pattern: summaries open while streaming and close when complete, unless the visitor manually toggles them. Each part stays in event order. Before summary text arrives, Eve's actual model activity drives a "Thinking" status; restored summaries start collapsed.
- Assistant parts and transient status share one compact stack. Tool calls follow shadcn's `Trace` pattern: a running line shows live progress, then becomes a collapsed `TraceCollapsible` when settled. Line height and chronological position stay consistent. Visitors expand results to inspect their Apps, inputs, or raw data; inputs and raw results use shadcn `CodeBlock` with wrapping, bounded scrolling, and copying.
- The Eve stream stays connected through each turn, including company-choice waits, and disconnects once the session is idle between turns. Sending a message or answering an interaction reopens it from the saved cursor; refresh catches up before applying the same policy. This uses `followWhile` and assumes this page initiates the work; external triggers would require continuous observation or an explicit refresh.
- The workspace uses a full-width shell with a history sidebar and bounded reading columns. Before the first message, the question input sits with the introduction and starter prompts; after sending, it stays below the independently scrolling transcript. shadcn's `MessageScroller` follows streamed text and App resizes, pauses following when scrolling up, and offers a down-arrow control to return to the latest content. Tool cards mount their Apps on first expansion, then preserve them when collapsed; initializing the sandbox inside a hidden panel can leave its first document blank. "Tool time" measures MCP execution, excluding model thinking and company-choice waits.
- An App can call only the six allowlisted tools, read only their App resources, open HTTP(S) links, send a message to the agent, and supply context for the next user message. Apps run inside an opaque-origin nested iframe with the resource's CSP.
- Stop requests cancel the active Eve turn. The `/api/playground/eve/*` proxy checks signed, HTTP-only session ownership cookies. The Eve channel accepts only signed internal proxy requests; visitor identity alone grants no session access. The most recent 12 conversations and their replay events are saved in this browser; removing a local entry does not delete its server-side run. Refresh reattaches to the saved session.

The default Eve sandbox is not used by these HTTP-only tools. Eve may install its development fallback, `just-bash`, which is included as a dev dependency. Production builds can report that no local sandbox provider is available; this feature does not invoke sandbox tools.

## Deploy in the existing Vercel project

Use Node 24 and these project Build and Deployment settings:

- Root Directory: `apps/web`.
- Build Command override: `cd ../.. && pnpm build`.
- Output Directory: framework default, with the override disabled.
- Include source files outside of the Root Directory: enabled.

The build command builds the embedded HTML, Eve runtime, and Next app from the workspace root. The Vercel project root must match the Next app root so Eve's generated `.eve/vercel-services/eve` service directory resolves correctly. `withEve` routes `/eve/v1/*` to the Eve service in the same deployment and leaves Next to serve the website and `/mcp`.

Configure `OPENAI_API_KEY`, `OPENAI_MODEL` (optional), and `PLAYGROUND_SESSION_SECRET` in the project environment. `SP500_MCP_URL` overrides the MCP target; otherwise `NEXT_PUBLIC_APP_URL`, the deployment's `VERCEL_URL`, or local port 3000 supplies the origin. Keep the existing Supabase and logo environment variables.

Protected previews use Vercel's default same-project Trusted Sources rule and Secure Backend Access with OIDC Federation. Internal MCP calls, App resource reads, the tool tester, and the Eve proxy resolve a short-lived token through `@vercel/oidc` and send `x-vercel-trusted-oidc-idp-token`. No additional bypass secret or public preview access is required. An explicitly configured `VERCEL_AUTOMATION_BYPASS_SECRET` remains supported. Both credentials are restricted to HTTPS origins listed in Vercel's project deployment URL variables and are never sent to an arbitrary remote `SP500_MCP_URL`. Resolve credentials inside each request/workflow step; do not persist them in workflow results.

For self-hosting, `pnpm start` starts Next and the built Eve sidecar. Local Eve workflow checkpoints live under `.eve`; preserve them when session recovery across process restarts is required. Vercel uses its managed workflow storage. Eve is pinned to `1.0.0-rc.1` because the integration APIs are still evolving.

## Validation

```sh
# Unit/contract checks; no model or database required
pnpm exec vitest run --config apps/web/vitest.playground.config.ts

# Adds real tools, all six HTML resources, and company-choice continuation
# Start the app and build apps/web-app first.
PLAYGROUND_TEST_URL=http://localhost:3000 pnpm exec vitest run --config apps/web/vitest.playground.config.ts

pnpm lint
pnpm type-check
pnpm build
```

Live checks use the real Supabase-backed MCP server. They do not call a paid model. A full real-model conversation additionally requires a valid OpenAI key.
