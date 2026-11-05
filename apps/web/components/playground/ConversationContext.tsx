'use client'

import { useState } from 'react'
import type { SessionView } from 'eve/events'
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextTrigger,
} from '@/components/ai-elements/context'
import { contextUsage } from '@/lib/playground/context-usage'

export function ConversationContext({
  view,
  model,
  contextWindow,
}: {
  view: SessionView
  model: string
  contextWindow?: number
}) {
  const [open, setOpen] = useState(false)
  const latest = contextUsage(view)
  // A saved conversation may have used a different model from the current config.
  const sameModel = !latest || latest.modelId === model || latest.modelId === `openai/${model}`
  return (
    <Context
      usedTokens={latest?.usedTokens}
      maxTokens={sameModel ? contextWindow : undefined}
      usage={latest?.usage}
      open={open}
      onOpenChange={setOpen}
    >
      <ContextTrigger aria-label="View context usage" aria-expanded={open} onClick={() => setOpen(true)} />
      <ContextContent
        side="top"
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-72 max-w-[calc(100vw-2rem)]"
      >
        <ContextContentHeader />
        <ContextContentBody>
          {latest ? (
            <>
              <ContextInputUsage />
              <ContextOutputUsage />
              <ContextCacheUsage />
              <p className="text-xs leading-5 text-muted-foreground">
                Last model call. Cached tokens are included in input.
              </p>
            </>
          ) : (
            <p className="text-xs leading-5 text-muted-foreground">Usage appears after the first model response.</p>
          )}
        </ContextContentBody>
        <ContextContentFooter>
          <span className="truncate">{latest?.modelId ?? model}</span>
          {latest?.costUsd !== undefined && (
            <span>
              Reported cost:{' '}
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 }).format(
                latest.costUsd,
              )}
            </span>
          )}
        </ContextContentFooter>
      </ContextContent>
    </Context>
  )
}
