import { ToolAppShell } from '@/components/tool-app/tool-app-shell'
import { CompanyFinancialsView } from './company-financials-view'
import { useCompanyFinancialsApp } from './use-company-financials-app'

export function CompanyFinancialsApp() {
  const { error, query, result, status } = useCompanyFinancialsApp()

  return (
    <ToolAppShell
      emptyMessage="Financial metrics will appear after the MCP Host returns tool results."
      error={error}
      failedTitle="Failed to load company financials"
      hasResult={Boolean(result)}
      maxWidthClassName="max-w-6xl"
      query={query}
      status={status}
      waitingTitle="Waiting for company financials"
    >
      {result ? <CompanyFinancialsView result={result} /> : null}
    </ToolAppShell>
  )
}
