import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@workspace/ui/components/item'
import type { CompanyOfficer, CompanyOfficersResult } from './types'
import { formatTotalPay } from './utils'

type CompanyOfficersViewProps = {
  result: CompanyOfficersResult
}

export function CompanyOfficersView({ result }: CompanyOfficersViewProps) {
  return (
    <main className="min-h-screen bg-background p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Executive Officers</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">{result.symbol}</h1>
          </div>
          <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground">
            {result.officers.length} officers
          </div>
        </header>

        <section>
          <ItemGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {result.officers.map(officer => (
              <OfficerCard key={`${officer.name}-${officer.title}`} officer={officer} />
            ))}
          </ItemGroup>
        </section>
      </div>
    </main>
  )
}

function OfficerCard({ officer }: { officer: CompanyOfficer }) {
  return (
    <Item
      className="items-start gap-x-3 gap-y-4 rounded-2xl bg-background p-5 shadow-sm transition-shadow hover:shadow-md"
      role="listitem"
      variant="outline"
    >
      <ItemMedia>
        <Avatar size="lg">
          <AvatarFallback>{officer.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="w-full truncate text-lg font-semibold text-foreground">{officer.name}</ItemTitle>
        <ItemDescription className="line-clamp-none text-sm leading-relaxed text-muted-foreground">
          {officer.title}
        </ItemDescription>
      </ItemContent>
      <ItemFooter>
        <dl className="grid w-full grid-cols-2 gap-3">
          <Metric label="Age" value={officer.age ? String(officer.age) : 'Not disclosed'} />
          <Metric label="Total Pay" value={formatTotalPay(officer.totalPay)} />
        </dl>
      </ItemFooter>
    </Item>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  )
}
