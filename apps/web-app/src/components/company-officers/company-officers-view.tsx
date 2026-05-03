import type { CompanyOfficer, CompanyOfficersResult } from './types'
import { formatTotalPay } from './utils'

type CompanyOfficersViewProps = {
  result: CompanyOfficersResult
}

export function CompanyOfficersView({ result }: CompanyOfficersViewProps) {
  return (
    <main className="min-h-screen bg-white p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Executive Officers</p>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{result.symbol}</h1>
          </div>
          <div className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-600">
            {result.officers.length} officers
          </div>
        </header>

        {result.summary ? <SummaryPanel summary={result.summary} /> : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {result.officers.map(officer => (
            <OfficerCard key={`${officer.name}-${officer.title}`} officer={officer} />
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

function OfficerCard({ officer }: { officer: CompanyOfficer }) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-700">
          {officer.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-neutral-900">{officer.name}</h2>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">{officer.title}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <Metric label="Age" value={officer.age ? String(officer.age) : 'Not disclosed'} />
        <Metric label="Total Pay" value={formatTotalPay(officer.totalPay)} />
      </dl>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-50 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-neutral-800">{value}</dd>
    </div>
  )
}
