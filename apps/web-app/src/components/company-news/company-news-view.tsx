import { useId } from 'react'
import { SparklesIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Field, FieldLabel, FieldLegend, FieldSet } from '@workspace/ui/components/field'
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
import { Spinner } from '@workspace/ui/components/spinner'
import type { CompanyNewsItem, CompanyNewsResult, SendNewsAnalysis } from './types'
import { useNewsAnalysis } from './use-news-analysis'
import { formatDate, getSentimentClass } from './utils'

type CompanyNewsViewProps = {
  result: CompanyNewsResult
  sendAnalysis?: SendNewsAnalysis
}

export function CompanyNewsView({ result, sendAnalysis }: CompanyNewsViewProps) {
  const { selectedUrls, status, error, selectArticle, analyzeSelected } = useNewsAnalysis(result, sendAnalysis)
  const canAnalyze = Boolean(sendAnalysis)

  return (
    <main className="min-h-screen bg-background p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Company News</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">{result.symbol}</h1>
          </div>
          <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground">
            {result.news.length} articles
          </div>
        </header>

        <FieldSet>
          <FieldLegend className="sr-only">Company news articles</FieldLegend>
          {canAnalyze ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Select articles to analyze their summaries in this conversation.
                </p>
                <Button
                  aria-busy={status === 'sending'}
                  disabled={!selectedUrls.length || status === 'sending' || status === 'sent'}
                  onClick={() => void analyzeSelected()}
                  type="button"
                >
                  {status === 'sending' ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <SparklesIcon data-icon="inline-start" />
                  )}
                  {status === 'sending' ? 'Sending…' : `Analyze selected (${selectedUrls.length})`}
                </Button>
              </div>
              {status === 'sent' ? (
                <Alert role="status">
                  <AlertTitle>Sent to conversation</AlertTitle>
                  <AlertDescription>View the AI analysis in this conversation.</AlertDescription>
                </Alert>
              ) : null}
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not send analysis request</AlertTitle>
                  <AlertDescription>{error} Select Analyze selected to retry.</AlertDescription>
                </Alert>
              ) : null}
            </div>
          ) : null}
          <ItemGroup className="gap-4">
            {result.news.map(item => (
              <NewsCard
                item={item}
                key={item.url}
                selection={
                  canAnalyze
                    ? {
                        checked: selectedUrls.includes(item.url),
                        disabled: status === 'sending',
                        onCheckedChange: checked => selectArticle(item.url, checked),
                      }
                    : undefined
                }
              />
            ))}
          </ItemGroup>
        </FieldSet>
      </div>
    </main>
  )
}

type NewsCardProps = {
  item: CompanyNewsItem
  selection?: {
    checked: boolean
    disabled: boolean
    onCheckedChange: (checked: boolean) => void
  }
}

function NewsCard({ item, selection }: NewsCardProps) {
  const selectionId = useId()

  return (
    <Item
      className="items-start gap-x-4 gap-y-2 rounded-2xl bg-background p-5 shadow-sm transition-shadow hover:shadow-md"
      role="listitem"
      variant="outline"
    >
      <ItemHeader className="justify-start text-xs text-muted-foreground">
        {selection ? (
          <Field className="w-auto" data-disabled={selection.disabled} orientation="horizontal">
            <Checkbox
              checked={selection.checked}
              disabled={selection.disabled}
              id={selectionId}
              onCheckedChange={checked => selection.onCheckedChange(checked === true)}
            />
            <FieldLabel className="sr-only" htmlFor={selectionId}>
              Select {item.title}
            </FieldLabel>
          </Field>
        ) : null}
        <span>{item.provider}</span>
        <span aria-hidden="true">•</span>
        <time dateTime={item.pubDate}>{formatDate(item.pubDate)}</time>
        <Badge className={cn('capitalize', getSentimentClass(item.lm_sentiment))} variant="outline">
          {item.lm_sentiment}
        </Badge>
      </ItemHeader>
      <ItemContent className="min-w-0 gap-2">
        <ItemTitle className="line-clamp-none w-full text-lg leading-snug font-semibold text-foreground">
          <a className="hover:text-muted-foreground" href={item.url} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        </ItemTitle>
        <ItemDescription className="line-clamp-none text-sm leading-relaxed text-muted-foreground">
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
