'use client'

import { useState, type ReactNode } from 'react'
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '@workspace/ui/components/trace'
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton } from '@workspace/ui/components/code-block'

export function ToolCard({
  title,
  icon,
  status,
  description,
  children,
  keepMounted = false,
}: {
  title: string
  icon: ReactNode
  status?: 'running' | 'error' | 'pending'
  description?: ReactNode
  children: ReactNode
  keepMounted?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const running = status === 'running'
  const line = (
    <TraceLine status={status}>
      <TraceIcon>{icon}</TraceIcon>
      <TraceTitle>{running ? `Running ${title}` : status === 'error' ? `Failed: ${title}` : title}</TraceTitle>
      {description && <TraceDescription>{description}</TraceDescription>}
    </TraceLine>
  )

  return (
    <Trace role="group" aria-label={title} data-tool={title}>
      {running ? (
        <div role="status">{line}</div>
      ) : (
        <TraceCollapsible open={expanded} onOpenChange={setExpanded}>
          <TraceCollapsibleTrigger aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}>
            {line}
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent forceMount={keepMounted ? true : undefined} hidden={!expanded}>
            {children}
          </TraceCollapsibleContent>
        </TraceCollapsible>
      )}
    </Trace>
  )
}

export function ToolData({ value, error = false }: { value: unknown; error?: boolean }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 2)

  return (
    <CodeBlock size="sm" variant={error ? 'destructive' : 'default'}>
      <CodeBlockActions>
        <CodeBlockCopyButton value={text} />
      </CodeBlockActions>
      <CodeBlockContent wrap className="max-h-96">
        {text}
      </CodeBlockContent>
    </CodeBlock>
  )
}
