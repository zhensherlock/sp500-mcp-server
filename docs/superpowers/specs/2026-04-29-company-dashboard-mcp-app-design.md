# SP500 MCP App - Company Dashboard

## Overview

MCP App that renders company basic info as an interactive dashboard inside MCP hosts (Claude, Claude Desktop, etc.), replacing plain JSON text responses with a visually appealing Apple-style card layout.

## Architecture

```
app/[transport]/
  apps/
    company-dashboard/
      mcp-app.html        # Vite entry point
      src/
        mcp-app.ts        # App class communication
        style.css         # Tailwind imports
      dist/
        mcp-app.html      # Built single-file output
  tools/
    get-company-info-tool.ts   # Modified: adds _meta.ui + registers resource
```

### Data Flow

```
User → "Show me Apple info"
  → get_company_info tool called
  → Tool returns _meta.ui.resourceUri = "ui://sp500/company-dashboard.html"
  → Host loads ui:// resource
  → iframe renders dashboard
  → app.ontoolresult receives { symbol, shortName, sector, ... }
  → User interacts in UI
```

## UI Layout

```
┌─────────────────────────────────────────────────┐
│  🍎 Apple Inc.                      [官网] [IR] │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ Technology  │ │ NASDAQ: AAPL│ │ 164,000   │ │
│  │ 行业        │ │ 股票类型    │ │ 员工数    │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
├─────────────────────────────────────────────────┤
│  📍 Cupertino, CA 95014, United States          │
│  📞 +1-408-996-1010                             │
├─────────────────────────────────────────────────┤
│  业务简介                            [展开 ▼]  │
│  Apple Inc. designs, manufactures, and markets… │
│  ────────────────────────────────────────────── │
│  Apple Inc. is a California corporation…        │
└─────────────────────────────────────────────────┘
```

## Data Structure

**Input:** `get_company_info` tool result

```typescript
interface CompanyInfo {
  symbol: string;
  shortName: string;
  longName: string;
  displayName: string;
  quoteType: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  website: string;
  irWebsite: string;
  sector: string;
  sectorKey: string;
  industry: string;
  industryKey: string;
  longBusinessSummary: string;
  fullTimeEmployees: number;
}
```

## Features

| Feature | Description |
|---------|-------------|
| Company header | Logo placeholder + shortName + action links |
| Info cards | 3-column grid: sector, quoteType, employees |
| Contact section | Address + phone with icons |
| Business summary | Collapsible text (3 lines default, expand to full) |
| External links | Website / IR open in new tab |

## Interactions

| Element | Interaction |
|---------|-------------|
| 行业/类型/员工卡片 | Hover scale(1.02) + shadow |
| 官网/IR 按钮 | Open link in new tab |
| "展开/收起" 按钮 | Toggle summary text visibility |
| 链接按钮 hover | Opacity 0.8 transition |

## Visual Style

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Card bg | `#F5F5F7` |
| Border radius | `24px` (rounded-3xl) |
| Font | System UI stack (-apple-system, BlinkMacSystemFont, Segoe UI) |
| Padding | `32px` (p-8) |
| Card gap | `16px` (gap-4) |
| Primary text | `#1D1D1F` |
| Secondary text | `#86868B` |

## Implementation

### Dependencies

```bash
pnpm add @modelcontextprotocol/ext-apps
pnpm add -D vite vite-plugin-singlefile
```

### Modified Tool Registration (get-company-info-tool.ts)

```typescript
// get-company-info-tool.ts
import { registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";

const RESOURCE_URI = "ui://sp500/company-dashboard.html";

// Tool schema - add _meta.ui.resourceUri
mcpServer.registerTool(
  "get_company_info",
  {
    title: "Get Company Info",
    description: "Get complete company basic info...",
    inputSchema: getCompanyInfoParams,
    _meta: { ui: { resourceUri: RESOURCE_URI } },  // NEW: enables MCP App
  },
  async (params) => { /* existing logic unchanged */ }
);

// NEW: Resource handler serves the HTML
registerAppResource(
  server,
  RESOURCE_URI,
  RESOURCE_URI,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => {
    const html = await fs.readFile(
      path.join(process.cwd(), "app/[transport]/apps/company-dashboard/dist/mcp-app.html"),
      "utf-8"
    );
    return { contents: [{ uri: RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE, text: html }] };
  }
);
```

**Note:** The existing tool handler logic remains unchanged. Adding `_meta.ui.resourceUri` makes the tool return both text response and UI reference. Hosts that support MCP Apps render the UI; others fall back to text.

### UI Client

```typescript
// src/mcp-app.ts
import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "SP500 Dashboard", version: "1.0.0" });
app.connect();

app.ontoolresult = (result) => {
  const data = JSON.parse(result.content[0].text);
  renderDashboard(data);
};
```

## Testing

1. Build: `INPUT=mcp-app.html vite build` (in `apps/company-dashboard/`)
2. Run dev server: `pnpm dev`
3. Test with basic-host or Claude with custom connector

## Files to Create/Modify

**Create:**
- `app/[transport]/apps/company-dashboard/mcp-app.html`
- `app/[transport]/apps/company-dashboard/src/mcp-app.ts`
- `app/[transport]/apps/company-dashboard/src/style.css`
- `app/[transport]/apps/company-dashboard/vite.config.ts`

**Modify:**
- `app/[transport]/tools/get-company-info-tool.ts` — add `_meta.ui.resourceUri` + resource handler
- `app/[transport]/route.ts` — import and register resource handler (if needed separately)