import { SearchXIcon } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty'
import { cn } from '@workspace/ui/lib/utils'

type CompanyNotFoundEmptyProps = {
  className?: string
  message: string
}

export function isCompanyNotFoundError(error?: string | null) {
  return error?.trim().startsWith('No companies found matching') ?? false
}

export function CompanyNotFoundEmpty({ className, message }: CompanyNotFoundEmptyProps) {
  return (
    <Empty className={cn('max-w-md border border-neutral-200 bg-neutral-50', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>No company found</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
