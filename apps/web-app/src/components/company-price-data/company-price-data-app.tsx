import { ToolAppShell } from '@/components/tool-app/tool-app-shell'

import { CompanyPriceDataView } from './company-price-data-view'
import { useCompanyPriceDataApp } from './use-company-price-data-app'

export function CompanyPriceDataApp() {
  const { error, query, result, status } = useCompanyPriceDataApp()

  return (
    <ToolAppShell
      emptyMessage="Price data will appear after the MCP Host returns tool results."
      error={error}
      failedTitle="Failed to load company price data"
      hasResult={Boolean(result)}
      maxWidthClassName="max-w-6xl"
      query={query}
      status={status}
      waitingTitle="Waiting for company price data"
    >
      {result ? <CompanyPriceDataView result={result} /> : null}
    </ToolAppShell>
  )
}
