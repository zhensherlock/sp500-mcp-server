import { ToolAppShell } from '@/components/tool-app/tool-app-shell'
import { CompanyOfficersView } from './company-officers-view'
import { useCompanyOfficersApp } from './use-company-officers-app'

export function CompanyOfficersApp() {
  const { error, query, result, status } = useCompanyOfficersApp()

  return (
    <ToolAppShell
      emptyMessage="Officers will appear after the MCP Host returns tool results."
      error={error}
      failedTitle="Failed to load company officers"
      hasResult={Boolean(result)}
      query={query}
      status={status}
      waitingTitle="Waiting for company officers"
    >
      {result ? <CompanyOfficersView result={result} /> : null}
    </ToolAppShell>
  )
}
