'use client'

import { useState } from 'react'
import type { SessionView } from 'eve/events'
import {
  Context,
  ContextContent,
  ContextContentBody,
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
  if (!latest) return null

  // A saved conversation may have used a different model from the current config.
  const sameModel = latest.modelId === model || latest.modelId === `openai/${model}`
  return (
    <Context
      usedTokens={latest.usedTokens}
      maxTokens={sameModel ? contextWindow : undefined}
      usage={latest.usage}
      open={open}
      onOpenChange={setOpen}
    >
      <ContextTrigger aria-label="View context usage" aria-expanded={open} onClick={() => setOpen(true)} />
      <ContextContent side="top" align="end" sideOffset={8} collisionPadding={16} className="max-w-[calc(100vw-2rem)]">
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
        </ContextContentBody>
      </ContextContent>
    </Context>
  )
}
