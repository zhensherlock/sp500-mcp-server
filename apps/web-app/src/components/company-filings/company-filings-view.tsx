import type { CompanyFiling, CompanyFilingsResult } from './types'
import { formatDate } from './utils'

type CompanyFilingsViewProps = {
  result: CompanyFilingsResult
}

export function CompanyFilingsView({ result }: CompanyFilingsViewProps) {
  return (
    <main className="min-h-screen bg-white p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">SEC Filings</p>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{result.symbol}</h1>
          </div>
          <div className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-600">
            {result.filings.length} filings
          </div>
        </header>

        {result.summary ? <SummaryPanel summary={result.summary} /> : null}

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {result.filings.map((filing, index) => (
            <FilingRow filing={filing} key={`${filing.edgarUrl}-${index}`} />
          ))}
        </section>
      </div>
    </main>
  )
}

function SummaryPanel({ summary }: { summary: string }) {
  return (
    <section className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
      <h2 className="mb-2 text-base font-semibold text-neutral-800">Summary</h2>
      <p className="text-sm leading-relaxed text-neutral-600">{summary}</p>
    </section>
  )
}

function FilingRow({ filing }: { filing: CompanyFiling }) {
  return (
    <article className="grid gap-3 border-b border-neutral-200 p-5 last:border-b-0 md:grid-cols-[7rem_1fr_auto] md:items-center">
      <div>
        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {filing.filing_type}
        </span>
        <time className="mt-2 block text-sm text-neutral-500" dateTime={filing.filing_date}>
          {formatDate(filing.filing_date)}
        </time>
      </div>

      <h2 className="text-base font-semibold leading-snug text-neutral-900">{filing.title}</h2>

      <a
        className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        href={filing.edgarUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        Open SEC
      </a>
    </article>
  )
}
