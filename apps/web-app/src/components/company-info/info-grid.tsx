import type { CompanyInfo } from './types'
import { formatEmployees } from './utils'

type InfoGridProps = {
  company: CompanyInfo
}

export function InfoGrid({ company }: InfoGridProps) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <InfoCard label="Sector" value={company.sector} />
      <InfoCard label="Quote Type" value={company.quoteType} />
      <InfoCard label="Employees" value={formatEmployees(company.fullTimeEmployees)} />
    </section>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="cursor-default rounded-2xl bg-neutral-100 p-5 transition-all hover:scale-[1.02] hover:shadow-md">
      <p className="mb-1 text-sm text-neutral-500">{label}</p>
      <p className="text-base font-medium text-neutral-800">{value}</p>
    </div>
  )
}
