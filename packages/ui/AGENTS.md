# AGENTS.md - packages/ui

## Scope

- Shared shadcn/Tailwind UI package consumed by both `apps/web` and `apps/web-app`.
- Exports are controlled by `package.json`: `./components/*`, `./lib/*`, `./hooks/*`, `./globals.css`, and `./postcss.config`.

## Commands

- Lint this package strictly: `pnpm --filter @workspace/ui lint`.
- Type-check shared UI explicitly: `pnpm exec tsc -p packages/ui/tsconfig.json --noEmit`; root `pnpm type-check` does not include `packages/*`.
- Run root `pnpm lint` before finishing changes that affect consumers, because app imports may surface shared UI issues.

## Component Conventions

- Put reusable primitives in `src/components`; app-specific layouts stay in the consuming app packages.
- Components import helpers and sibling primitives through `@workspace/ui/*`, matching the package exports rather than relative paths.
- Keep `class-variance-authority` variant exports beside their component when local consumers need to compose styles.
- Recharts helpers live in `src/components/chart.tsx`; `ChartContainer` injects per-chart CSS variables from its `config`.

## Styling

- `src/styles/globals.css` owns Tailwind v4 imports, shadcn tokens, light/dark variables, shared scrollbar styles, and animation visibility defaults.
- App PostCSS configs re-export `@workspace/ui/postcss.config`; changing this package can affect both apps.
- shadcn config here uses `radix-nova`, lucide icons, and aliases rooted at `@workspace/ui/*`; keep generated primitives compatible with those aliases.
