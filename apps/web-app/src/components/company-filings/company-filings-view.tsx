import type { CompanyFiling, CompanyFilingsResult } from './types'
import { formatDate } from './utils'

type CompanyFilingsViewProps = {
  result: CompanyFilingsResult
}

export function CompanyFilingsView({ result }: CompanyFilingsViewProps) {
  return (
    <main className="min-h-screen bg-background p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">SEC Filings</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">{result.symbol}</h1>
          </div>
          <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground">
            {result.filings.length} filings
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          {result.filings.map(filing => (
            <FilingRow filing={filing} key={filing.edgarUrl} />
          ))}
        </section>
      </div>
    </main>
  )
}

function FilingRow({ filing }: { filing: CompanyFiling }) {
  return (
    <article className="grid gap-3 border-b border-border p-5 last:border-b-0 md:grid-cols-[7rem_1fr_auto] md:items-center">
      <div>
        <span className="inline-flex rounded-full border border-link/25 bg-link/10 px-2.5 py-1 text-xs font-semibold text-link">
          {filing.filing_type}
        </span>
        <time className="mt-2 block text-sm text-muted-foreground" dateTime={filing.filing_date}>
          {formatDate(filing.filing_date)}
        </time>
      </div>

      <h2 className="text-base font-semibold leading-snug text-foreground">{filing.title}</h2>

      <a
        className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-ring hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={filing.edgarUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        Open SEC
      </a>
    </article>
  )
}
