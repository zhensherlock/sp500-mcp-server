import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from '@workspace/ui/components/item'
import { cn } from '@workspace/ui/lib/utils'
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

        <section>
          <ItemGroup className="gap-4">
            {result.news.map(item => (
              <NewsCard item={item} key={item.url} />
            ))}
          </ItemGroup>
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
    <Item
      className="items-start gap-x-4 gap-y-2 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      role="listitem"
      variant="outline"
    >
      <ItemHeader className="justify-start text-xs text-neutral-500">
        <span>{item.provider}</span>
        <span aria-hidden="true">•</span>
        <time dateTime={item.pubDate}>{formatDate(item.pubDate)}</time>
        <Badge className={cn('capitalize', getSentimentClass(item.lm_sentiment))} variant="outline">
          {item.lm_sentiment}
        </Badge>
      </ItemHeader>
      <ItemContent className="min-w-0 gap-2">
        <ItemTitle className="line-clamp-none w-full text-lg leading-snug font-semibold text-neutral-900">
          <a className="hover:text-neutral-600" href={item.url} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        </ItemTitle>
        <ItemDescription className="line-clamp-none text-sm leading-relaxed text-neutral-600">
          {item.summary}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="hidden shrink-0 self-start sm:flex">
        <Button asChild size="sm" variant="outline">
          <a href={item.url} rel="noopener noreferrer" target="_blank">
            Read
          </a>
        </Button>
      </ItemActions>
    </Item>
  )
}
