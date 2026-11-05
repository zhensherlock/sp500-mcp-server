'use client'

// Adapted from AI Elements Context for AI SDK 7 and unknown context capacities.
import { createContext, useContext, type ComponentProps } from 'react'
import type { LanguageModelUsage } from 'ai'
import { Button } from '@workspace/ui/components/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@workspace/ui/components/hover-card'
import { Progress } from '@workspace/ui/components/progress'
import { cn } from '@workspace/ui/lib/utils'

interface ContextSchema {
  usedTokens?: number
  maxTokens?: number
  usage?: LanguageModelUsage
}

const ContextContext = createContext<ContextSchema | null>(null)
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })

function useContextValue() {
  const value = useContext(ContextContext)
  if (!value) throw new Error('Context components must be used within Context')
  return value
}

function utilization({ usedTokens, maxTokens }: ContextSchema) {
  return usedTokens !== undefined && maxTokens !== undefined && Number.isFinite(maxTokens) && maxTokens > 0
    ? Math.min(usedTokens / maxTokens, 1)
    : undefined
}

export function Context({ usedTokens, maxTokens, usage, ...props }: ComponentProps<typeof HoverCard> & ContextSchema) {
  return (
    <ContextContext.Provider value={{ usedTokens, maxTokens, usage }}>
      <HoverCard openDelay={150} closeDelay={100} {...props} />
    </ContextContext.Provider>
  )
}

function ContextIcon() {
  const fraction = utilization(useContextValue())
  const circumference = 2 * Math.PI * 10
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" data-icon="inline-start">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      {fraction !== undefined && (
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      )}
    </svg>
  )
}

export function ContextTrigger({ children, ...props }: ComponentProps<typeof Button>) {
  const value = useContextValue()
  const fraction = utilization(value)
  return (
    <HoverCardTrigger asChild>
      <Button type="button" variant="ghost" size="sm" {...props}>
        {children ?? (
          <>
            <ContextIcon />
            <span>
              {fraction !== undefined
                ? percent.format(fraction)
                : value.usedTokens !== undefined
                  ? `${compact.format(value.usedTokens)} tokens`
                  : 'Context'}
            </span>
          </>
        )}
      </Button>
    </HoverCardTrigger>
  )
}

export function ContextContent({ className, ...props }: ComponentProps<typeof HoverCardContent>) {
  return <HoverCardContent className={cn('flex flex-col gap-3', className)} {...props} />
}

export function ContextContentHeader({ children, className, ...props }: ComponentProps<'div'>) {
  const value = useContextValue()
  const fraction = utilization(value)
  return (
    <div className={cn('flex w-full flex-col gap-3', className)} {...props}>
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">Context</span>
            {value.usedTokens !== undefined ? (
              <span className="text-muted-foreground tabular-nums">
                {compact.format(value.usedTokens)}
                {fraction !== undefined && value.maxTokens !== undefined && ` / ${compact.format(value.maxTokens)}`}
              </span>
            ) : value.maxTokens !== undefined ? (
              <span className="text-muted-foreground tabular-nums">{compact.format(value.maxTokens)} token limit</span>
            ) : null}
          </div>
          {fraction !== undefined && <Progress aria-label="Context window used" value={fraction * 100} />}
        </>
      )}
    </div>
  )
}

export function ContextContentBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex w-full flex-col gap-2', className)} {...props} />
}

export function ContextContentFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex w-full flex-col gap-1 bg-muted/50 p-3 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function UsageRow({ label, tokens }: { label: string; tokens?: number }) {
  if (tokens === undefined) return null
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{compact.format(tokens)}</span>
    </div>
  )
}

export function ContextInputUsage() {
  return <UsageRow label="Input" tokens={useContextValue().usage?.inputTokens} />
}

export function ContextOutputUsage() {
  return <UsageRow label="Output" tokens={useContextValue().usage?.outputTokens} />
}

export function ContextCacheUsage() {
  const details = useContextValue().usage?.inputTokenDetails
  return (
    <>
      {Boolean(details?.cacheReadTokens) && (
        <UsageRow label="Cached input (included)" tokens={details?.cacheReadTokens} />
      )}
      {Boolean(details?.cacheWriteTokens) && (
        <UsageRow label="Cache write (included)" tokens={details?.cacheWriteTokens} />
      )}
    </>
  )
}
