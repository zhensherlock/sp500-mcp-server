import type { ReactNode } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import type { CompanyInfo } from './types'

type CompanyHeaderProps = {
  company: CompanyInfo
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <CompanyAvatar company={company} />
        <h1 className="truncate text-2xl font-semibold text-neutral-800">{company.shortName}</h1>
      </div>

      <div className="flex shrink-0 gap-2">
        <CompanyLink href={company.website}>Website</CompanyLink>
        <CompanyLink href={company.irWebsite}>IR</CompanyLink>
      </div>
    </header>
  )
}

function CompanyAvatar({ company }: { company: CompanyInfo }) {
  const fallback = (company.symbol ?? company.shortName).trim().charAt(0).toUpperCase()
  const logoUrl = getTickerLogoUrl(company.symbol)

  return (
    <Avatar aria-label={`${company.shortName} logo`} className="bg-background shadow-sm" role="img" size="lg">
      {logoUrl ? (
        <AvatarImage alt="" className="bg-background object-contain p-1.5" decoding="async" src={logoUrl} />
      ) : null}
      <AvatarFallback>{fallback || '?'}</AvatarFallback>
    </Avatar>
  )
}

function getTickerLogoUrl(symbol?: string) {
  const ticker = symbol?.trim()

  if (!ticker) {
    return null
  }

  const params = new URLSearchParams({
    fallback: '404',
    format: 'png',
    retina: 'true',
    size: '40',
  })

  return `/api/logo/ticker/${encodeURIComponent(ticker)}?${params.toString()}`
}

function CompanyLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  )
}
