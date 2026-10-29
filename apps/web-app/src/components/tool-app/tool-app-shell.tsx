import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { CompanyNotFoundEmpty, isCompanyNotFoundError } from './company-not-found-empty'
import type { AppStatus } from './types'

type ToolAppShellProps = {
  children: ReactNode
  emptyMessage: string
  error?: string | null
  failedTitle: string
  hasResult: boolean
  maxWidthClassName?: string
  query?: string | null
  showPendingBorder?: boolean
  status: AppStatus
  waitingTitle: string
}

export function ToolAppShell({
  children,
  emptyMessage,
  error,
  failedTitle,
  hasResult,
  maxWidthClassName = 'max-w-4xl',
  query,
  showPendingBorder = true,
  status,
  waitingTitle,
}: ToolAppShellProps) {
  if (hasResult) {
    return <>{children}</>
  }

  const panelBorderClassName = showPendingBorder ? 'border border-border' : ''
  const isCompanyNotFound = status === 'error' && isCompanyNotFoundError(error)

  return (
    <main className="min-h-screen bg-background p-8 font-sans text-foreground">
      {isCompanyNotFound ? (
        <CompanyNotFoundEmpty className={cn('mx-auto', maxWidthClassName)} message={error ?? 'No company found.'} />
      ) : (
        <div className={cn('mx-auto rounded-2xl bg-muted p-5', panelBorderClassName, maxWidthClassName)}>
          <p className="text-sm font-medium">{status === 'error' ? failedTitle : waitingTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{error ?? (query ? `Querying ${query}` : emptyMessage)}</p>
        </div>
      )}
    </main>
  )
}
