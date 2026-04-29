# Company Dashboard MCP App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add MCP App support to `get_company_info` tool - when host supports MCP Apps, render an interactive Apple-style dashboard; otherwise fall back to text.

**Architecture:** Add `_meta.ui.resourceUri` to existing tool schema, register a resource handler that serves a bundled single-file HTML, use `@modelcontextprotocol/ext-apps` App class for iframe-to-host communication.

**Tech Stack:** `@modelcontextprotocol/ext-apps`, Vite + vite-plugin-singlefile, Tailwind CSS

---

## File Structure

```
app/[transport]/
  apps/
    company-dashboard/
      mcp-app.html        # Vite entry point (single file build input)
      src/
        mcp-app.ts        # App class + render logic
        style.css         # Tailwind @import
      dist/
        mcp-app.html      # Built output (single file)
      package.json        # Vite build scripts
      tsconfig.json       # TypeScript config
      vite.config.ts      # Vite + singlefile plugin
  tools/
    get-company-info-tool.ts   # Modified: adds _meta.ui.resourceUri + registerAppResource
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json` (add dependencies)

- [ ] **Step 1: Add dependencies**

```bash
pnpm add @modelcontextprotocol/ext-apps
pnpm add -D vite vite-plugin-singlefile
```

Expected output: packages added, lockfile updated

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add @modelcontextprotocol/ext-apps, vite, vite-plugin-singlefile"
```

---

## Task 2: Create MCP App Project Structure

**Files:**
- Create: `app/[transport]/apps/company-dashboard/package.json`
- Create: `app/[transport]/apps/company-dashboard/tsconfig.json`
- Create: `app/[transport]/apps/company-dashboard/vite.config.ts`
- Create: `app/[transport]/apps/company-dashboard/mcp-app.html`
- Create: `app/[transport]/apps/company-dashboard/src/style.css`
- Create: `app/[transport]/apps/company-dashboard/src/mcp-app.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "type": "module",
  "scripts": {
    "build": "INPUT=mcp-app.html vite build",
    "dev": "vite build --watch"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["*.ts", "src/**/*.ts"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: process.env.INPUT,
    },
  },
});
```

- [ ] **Step 4: Create mcp-app.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Company Dashboard</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/mcp-app.ts"></script>
</body>
</html>
```

- [ ] **Step 5: Create src/style.css**

```css
@import "tailwindcss";
```

- [ ] **Step 6: Create src/mcp-app.ts**

```typescript
import { App } from "@modelcontextprotocol/ext-apps";
import "./style.css";

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

const app = new App({ name: "SP500 Dashboard", version: "1.0.0" });

function formatEmployees(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderDashboard(data: CompanyInfo) {
  const el = document.getElementById("app")!;
  const isLong = data.longBusinessSummary.length > 300;
  const summaryPreview = isLong
    ? data.longBusinessSummary.slice(0, 300) + "..."
    : data.longBusinessSummary;

  el.innerHTML = `
    <div class="min-h-screen bg-white p-8 font-sans">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
              ${escapeHtml(data.shortName.charAt(0))}
            </div>
            <h1 class="text-2xl font-semibold text-neutral-800">${escapeHtml(data.shortName)}</h1>
          </div>
          <div class="flex gap-2">
            <a href="${escapeHtml(data.website)}" target="_blank" rel="noopener"
               class="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-opacity opacity-80 hover:opacity-100">
              官网
            </a>
            <a href="${escapeHtml(data.irWebsite)}" target="_blank" rel="noopener"
               class="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-opacity opacity-80 hover:opacity-100">
              IR
            </a>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-neutral-100 rounded-2xl p-5 hover:scale-102 hover:shadow-md transition-all cursor-default">
            <p class="text-sm text-neutral-500 mb-1">行业</p>
            <p class="text-base font-medium text-neutral-800">${escapeHtml(data.sector)}</p>
          </div>
          <div class="bg-neutral-100 rounded-2xl p-5 hover:scale-102 hover:shadow-md transition-all cursor-default">
            <p class="text-sm text-neutral-500 mb-1">股票类型</p>
            <p class="text-base font-medium text-neutral-800">${escapeHtml(data.quoteType)}</p>
          </div>
          <div class="bg-neutral-100 rounded-2xl p-5 hover:scale-102 hover:shadow-md transition-all cursor-default">
            <p class="text-sm text-neutral-500 mb-1">员工数</p>
            <p class="text-base font-medium text-neutral-800">${formatEmployees(data.fullTimeEmployees)}</p>
          </div>
        </div>

        <div class="bg-neutral-50 rounded-2xl p-5 mb-6">
          <div class="flex items-start gap-2 text-neutral-600 text-sm">
            <span>📍</span>
            <span>${escapeHtml(data.address)}, ${escapeHtml(data.city)}, ${escapeHtml(data.zip)}, ${escapeHtml(data.country)}</span>
          </div>
          <div class="flex items-start gap-2 text-neutral-600 text-sm mt-2">
            <span>📞</span>
            <span>${escapeHtml(data.phone)}</span>
          </div>
        </div>

        <div class="bg-neutral-50 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-semibold text-neutral-800">业务简介</h2>
            ${isLong ? `<button id="toggle-btn" class="text-sm text-blue-500 hover:text-blue-600">展开</button>` : ""}
          </div>
          <p id="summary-text" class="text-sm text-neutral-600 leading-relaxed">${escapeHtml(summaryPreview)}</p>
          ${isLong ? `<p id="summary-full" class="text-sm text-neutral-600 leading-relaxed hidden">${escapeHtml(data.longBusinessSummary)}</p>` : ""}
        </div>
      </div>
    </div>
  `;

  const toggleBtn = document.getElementById("toggle-btn");
  if (toggleBtn) {
    const preview = document.getElementById("summary-text")!;
    const full = document.getElementById("summary-full")!;
    toggleBtn.addEventListener("click", () => {
      const expanded = toggleBtn.textContent === "收起";
      toggleBtn.textContent = expanded ? "展开" : "收起";
      preview.classList.toggle("hidden", !expanded);
      full.classList.toggle("hidden", expanded);
    });
  }
}

app.connect();

app.ontoolresult = (result) => {
  try {
    const data = JSON.parse(result.content[0].text);
    renderDashboard(data);
  } catch {
    console.error("Failed to parse tool result");
  }
};
```

- [ ] **Step 7: Commit**

```bash
git add app/[transport]/apps/company-dashboard/
git commit -m "feat(mcp-app): create company dashboard MCP App structure"
```

---

## Task 3: Build MCP App

**Files:**
- Create: `app/[transport]/apps/company-dashboard/dist/mcp-app.html`

- [ ] **Step 1: Run build**

```bash
cd app/[transport]/apps/company-dashboard && pnpm build
```

Expected: `dist/mcp-app.html` created, contains bundled CSS/JS

- [ ] **Step 2: Verify dist output exists**

```bash
ls -la app/[transport]/apps/company-dashboard/dist/
```

Expected: `mcp-app.html` exists

- [ ] **Step 3: Commit**

```bash
git add app/[transport]/apps/company-dashboard/dist/
git commit -m "feat(mcp-app): build company dashboard dist"
```

---

## Task 4: Modify get-company-info-tool.ts

**Files:**
- Modify: `app/[transport]/tools/get-company-info-tool.ts`

- [ ] **Step 1: Read existing file**

```typescript
// Read current implementation at app/[transport]/tools/get-company-info-tool.ts
// Existing imports, zod schema, and registerTool call should remain unchanged
// Only additions: import registerAppResource + fs/promises, add _meta.ui.resourceUri to tool schema, add registerAppResource call
```

- [ ] **Step 2: Add imports**

Add to top of file after existing imports:
```typescript
import { registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import fs from "node:fs/promises";
import path from "node:path";
```

- [ ] **Step 3: Define RESOURCE_URI constant**

```typescript
const RESOURCE_URI = "ui://sp500/company-dashboard.html";
```

- [ ] **Step 4: Add _meta.ui to tool schema**

In the `mcpServer.registerTool` call, add `_meta: { ui: { resourceUri: RESOURCE_URI } }` to the tool description object (second argument):

```typescript
mcpServer.registerTool(
  "get_company_info",
  {
    title: "Get Company Info",
    description: "Get complete company basic info, supports symbol and company name queries.",
    inputSchema: getCompanyInfoParams,
    _meta: { ui: { resourceUri: RESOURCE_URI } },  // ADD THIS LINE
  },
  async (params) => { /* existing handler - no changes */ }
);
```

- [ ] **Step 5: Add registerAppResource call**

After the `mcpServer.registerTool` call, add:

```typescript
registerAppResource(
  mcpServer,
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

- [ ] **Step 6: Commit**

```bash
git add app/[transport]/tools/get-company-info-tool.ts
git commit -m "feat(mcp): enable MCP App for get_company_info tool"
```

---

## Task 5: Verify Build

**Files:**
- None (verification only)

- [ ] **Step 1: Run typecheck**

```bash
pnpm type-check
```

Expected: No errors

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: No errors

- [ ] **Step 3: Run dev server and test manually**

```bash
pnpm dev
```

Then test with basic-host or Claude with custom connector:
```bash
cd ext-apps/examples/basic-host
SERVERS='["http://localhost:3000/mcp"]' npm start
```

Navigate to http://localhost:8080, find `get_company_info` tool, call with query "Apple", verify dashboard renders.

---

## Self-Review Checklist

- [ ] Spec coverage: All features from spec implemented (header, info cards, contact, summary expand/collapse)
- [ ] No placeholders: All code is complete, no "TBD", "TODO", or vague descriptions
- [ ] Type consistency: `RESOURCE_URI` matches in tool and resource handler
- [ ] File paths: All paths match actual project structure

---

## Plan Complete

Saved to: `docs/superpowers/plans/2026-04-29-company-dashboard-mcp-app-plan.md`

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**