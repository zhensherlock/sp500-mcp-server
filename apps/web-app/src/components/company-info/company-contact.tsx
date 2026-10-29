import type { CompanyInfo } from './types'

type CompanyContactProps = {
  company: CompanyInfo
}

export function CompanyContact({ company }: CompanyContactProps) {
  return (
    <section className="mb-6 rounded-2xl bg-muted p-5">
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <span aria-hidden="true">📍</span>
        <span>
          {company.address}, {company.city}, {company.zip}, {company.country}
        </span>
      </div>
      <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
        <span aria-hidden="true">📞</span>
        <span>{company.phone}</span>
      </div>
    </section>
  )
}
