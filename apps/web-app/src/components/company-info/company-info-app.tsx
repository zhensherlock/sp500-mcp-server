import { CompanyInfoCard } from './company-info-card'
import { useCompanyInfoApp } from './use-company-info-app'

export function CompanyInfoApp() {
  const { company, error, query, status } = useCompanyInfoApp()

  if (!company) {
    return (
      <main className="min-h-screen bg-white p-8 font-sans text-neutral-800">
        <div className="mx-auto max-w-3xl rounded-2xl bg-neutral-50 p-5">
          <p className="text-sm font-medium text-neutral-800">
            {status === 'error' ? 'Failed to load company info' : 'Waiting for company info'}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {error ?? (query ? `Querying ${query}` : 'Company details will appear after the MCP Host returns tool results.')}
          </p>
        </div>
      </main>
    )
  }

  return <CompanyInfoCard company={company} />
}
