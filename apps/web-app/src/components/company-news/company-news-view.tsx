import type { CompanyNewsItem, CompanyNewsResult } from './types'
import { formatDate, getSentimentClass } from './utils'

type CompanyNewsViewProps = {
  result: CompanyNewsResult
}

export function CompanyNewsView({ result }: CompanyNewsViewProps) {
  return (
    <main className="min-h-screen bg-white p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Company News</p>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{result.symbol}</h1>
          </div>
          <div className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-600">
            {result.news.length} articles
          </div>
        </header>

        {result.summary ? <SummaryPanel summary={result.summary} /> : null}

        <section className="space-y-4">
          {result.news.map((item, index) => (
            <NewsCard item={item} key={`${item.url}-${index}`} />
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

function NewsCard({ item }: { item: CompanyNewsItem }) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <span>{item.provider}</span>
        <span aria-hidden="true">•</span>
        <time dateTime={item.pubDate}>{formatDate(item.pubDate)}</time>
        <span
          className={`rounded-full border px-2 py-0.5 font-medium capitalize ${getSentimentClass(item.lm_sentiment)}`}
        >
          {item.lm_sentiment}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-snug text-neutral-900">
            <a className="hover:text-neutral-600" href={item.url} rel="noopener noreferrer" target="_blank">
              {item.title}
            </a>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.summary}</p>
        </div>
        <a
          className="hidden shrink-0 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-100 sm:inline-flex"
          href={item.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          Read
        </a>
      </div>
    </article>
  )
}
