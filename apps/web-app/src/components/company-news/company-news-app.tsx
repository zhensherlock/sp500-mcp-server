import { CompanyNewsView } from './company-news-view'
import { useCompanyNewsApp } from './use-company-news-app'

export function CompanyNewsApp() {
  const { error, query, result, status } = useCompanyNewsApp()

  if (!result) {
    return (
      <main className="min-h-screen bg-white p-8 font-sans text-neutral-800">
        <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-sm font-medium">
            {status === 'error' ? 'Failed to load company news' : 'Waiting for company news'}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {error ?? (query ? `Querying ${query}` : 'News will appear after the MCP Host returns tool results.')}
          </p>
        </div>
      </main>
    )
  }

  return <CompanyNewsView result={result} />
}
