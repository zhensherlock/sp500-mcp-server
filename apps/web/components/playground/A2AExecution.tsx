'use client'

import { useState } from 'react'
import { Bot, CircleAlert, CircleCheck, CirclePause, CircleSlash, FileJson } from 'lucide-react'
import { Spinner } from '@workspace/ui/components/spinner'
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
import type { A2AProgress, A2AReply } from '@/lib/a2a-playground/contracts'
import { ToolCard, ToolData } from './ToolCard'

const steps = [
  ['company', 'Find company'],
  ['financials', 'Fetch annual financials'],
  ['news', 'Fetch recent news'],
] as const

const outcomes = {
  running: ['Running', Spinner],
  completed: ['Done', CircleCheck],
  waiting: ['Choose a company', CirclePause],
  empty: ['No results', CircleSlash],
  unavailable: ['Unavailable', CircleAlert],
} as const

type ExecutionStatus = 'Running' | 'Waiting for input' | 'Complete' | 'Failed' | 'Status unavailable'

export function A2AExecution({
  status,
  progress,
  data,
}: {
  status: ExecutionStatus
  progress?: A2AProgress
  data?: A2AReply['data']
}) {
  const [open, setOpen] = useState<boolean>()
  const running = status === 'Running'
  const hasDetails = Boolean(data) || steps.some(([step]) => progress?.[step])
  const header = (
    <TraceLine status={running ? 'running' : status === 'Failed' ? 'error' : undefined}>
      <TraceIcon>{running ? <Spinner /> : <Bot />}</TraceIcon>
      <TraceTitle>Company Brief Agent</TraceTitle>
      <TraceDescription>{status}</TraceDescription>
    </TraceLine>
  )

  return (
    <Trace role="group" aria-label="A2A execution">
      {hasDetails ? (
        <TraceCollapsible open={open ?? running} onOpenChange={setOpen}>
          <TraceCollapsibleTrigger>{header}</TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <ul className="space-y-2">
              {steps.map(([step, title]) => {
                const state = progress?.[step]
                if (!state) return null
                const [label, Icon] = outcomes[state]
                return (
                  <li key={step}>
                    <TraceLine status={state === 'running' ? 'running' : state === 'unavailable' ? 'error' : undefined}>
                      <TraceIcon>
                        <Icon />
                      </TraceIcon>
                      <TraceTitle className="whitespace-normal">{title}</TraceTitle>
                      <TraceDescription>{label}</TraceDescription>
                    </TraceLine>
                  </li>
                )
              })}
              {data && (
                <li>
                  <ToolCard title="Structured output (JSON)" icon={<FileJson />}>
                    <ToolData value={data} />
                  </ToolCard>
                </li>
              )}
            </ul>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      ) : (
        <div role={running ? 'status' : undefined}>{header}</div>
      )}
    </Trace>
  )
}
