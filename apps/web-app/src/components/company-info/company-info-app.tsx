import { ToolAppShell } from '@/components/tool-app/tool-app-shell'
import { CompanyInfoCard } from './company-info-card'
import { useCompanyInfoApp } from './use-company-info-app'

export function CompanyInfoApp() {
  const { company, error, query, status } = useCompanyInfoApp()

  return (
    <ToolAppShell
      emptyMessage="Company details will appear after the MCP Host returns tool results."
      error={error}
      failedTitle="Failed to load company info"
      hasResult={Boolean(company)}
      maxWidthClassName="max-w-3xl"
      query={query}
      showPendingBorder={false}
      status={status}
      waitingTitle="Waiting for company info"
    >
      {company ? <CompanyInfoCard company={company} /> : null}
    </ToolAppShell>
  )
}
