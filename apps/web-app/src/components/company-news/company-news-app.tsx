import { ToolAppShell } from '@/components/tool-app/tool-app-shell'
import { CompanyNewsView } from './company-news-view'
import { useCompanyNewsApp } from './use-company-news-app'

export function CompanyNewsApp() {
  const { error, query, result, status } = useCompanyNewsApp()

  return (
    <ToolAppShell
      emptyMessage="News will appear after the MCP Host returns tool results."
      error={error}
      failedTitle="Failed to load company news"
      hasResult={Boolean(result)}
      query={query}
      status={status}
      waitingTitle="Waiting for company news"
    >
      {result ? <CompanyNewsView result={result} /> : null}
    </ToolAppShell>
  )
}
