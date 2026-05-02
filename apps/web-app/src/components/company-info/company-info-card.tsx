import type { CompanyInfo } from './types'
import { BusinessSummary } from './business-summary'
import { CompanyContact } from './company-contact'
import { CompanyHeader } from './company-header'
import { InfoGrid } from './info-grid'

type CompanyInfoCardProps = {
  company: CompanyInfo
}

export function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  return (
    <main className="min-h-screen bg-white p-8 font-sans">
      <div className="mx-auto max-w-3xl">
        <CompanyHeader company={company} />
        <InfoGrid company={company} />
        <CompanyContact company={company} />
        <BusinessSummary summary={company.longBusinessSummary} />
      </div>
    </main>
  )
}
