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
        <h1 className="truncate text-2xl font-semibold text-foreground">{company.shortName}</h1>
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
    <Avatar aria-label={`${company.shortName} logo`} className="bg-logo-background shadow-sm" role="img" size="lg">
      {logoUrl ? (
        <AvatarImage alt="" className="bg-logo-background object-contain p-1.5" decoding="async" src={logoUrl} />
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
  const logoApiBaseUrl = getLogoApiBaseUrl()

  return `${logoApiBaseUrl}/api/logo/ticker/${encodeURIComponent(ticker)}?${params.toString()}`
}

function getLogoApiBaseUrl() {
  const runtimeBaseUrl = getRuntimeAssetBaseUrl()
  const configuredBaseUrl = import.meta.env.VITE_SP500_MCP_ASSET_BASE_URL
  const baseUrl = runtimeBaseUrl || configuredBaseUrl || ''

  return baseUrl.replace(/\/+$/, '')
}

function getRuntimeAssetBaseUrl() {
  if (typeof globalThis === 'undefined') {
    return ''
  }

  const runtimeConfig = globalThis as typeof globalThis & {
    __SP500_MCP_ASSET_BASE_URL__?: unknown
  }

  return typeof runtimeConfig.__SP500_MCP_ASSET_BASE_URL__ === 'string'
    ? runtimeConfig.__SP500_MCP_ASSET_BASE_URL__
    : ''
}

function CompanyLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-ring hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  )
}
