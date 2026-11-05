'use client'

import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { Spinner } from '@workspace/ui/components/spinner'
import { Streamdown } from 'streamdown'
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '@workspace/ui/components/trace'

export function Reasoning({ text, running }: { text: string; running: boolean }) {
  const [open, setOpen] = useState<boolean>()
  const line = (
    <TraceLine status={running ? 'running' : undefined}>
      <TraceIcon>{running ? <Spinner aria-hidden="true" /> : <CircleCheck />}</TraceIcon>
      <TraceTitle>{running ? 'Thinking' : 'Thought'}</TraceTitle>
    </TraceLine>
  )

  return (
    <Trace>
      {text.length === 0 ? (
        <div role={running ? 'status' : undefined}>{line}</div>
      ) : (
        <TraceCollapsible open={open ?? running} onOpenChange={setOpen}>
          <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <Streamdown isAnimating={running}>{text}</Streamdown>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      )}
    </Trace>
  )
}
