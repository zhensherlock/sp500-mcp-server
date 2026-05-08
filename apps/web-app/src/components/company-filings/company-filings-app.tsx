import { ToolAppShell } from '@/components/tool-app/tool-app-shell'

import { CompanyFilingsView } from './company-filings-view'
import { useCompanyFilingsApp } from './use-company-filings-app'

export function CompanyFilingsApp() {
  const { error, query, result, status } = useCompanyFilingsApp()

  return (
    <ToolAppShell
      emptyMessage="Filings will appear after the MCP Host returns tool results."
      error={error}
      failedTitle="Failed to load company filings"
      hasResult={Boolean(result)}
      query={query}
      status={status}
      waitingTitle="Waiting for company filings"
    >
      {result ? <CompanyFilingsView result={result} /> : null}
    </ToolAppShell>
  )
}
