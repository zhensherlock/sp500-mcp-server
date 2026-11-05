import { describe, expect, it } from 'vitest'
import { emptySessionView, foldEvents, usage, type ReceivedEvent } from 'eve/events'
import { contextUsage } from '../../lib/playground/context-usage'
import { modelContextWindow } from '../../lib/playground/model-context'

function modelRun(
  runId: string,
  inputTokens: number,
  outputTokens: number,
  options: { summary?: boolean; outcome?: 'completed' | 'failed'; cacheReadTokens?: number; costUsd?: number } = {},
): Omit<ReceivedEvent, 'meta'>[] {
  return [
    { type: 'model.requested', data: { runId, owner: options.summary ? { changeId: 'compact' } : { turnId: 'turn' } } },
    { type: 'model.started', data: { runId, modelId: 'test-model', attempt: 0 } },
    {
      type: 'usage.recorded',
      data: {
        owner: { runId },
        kind: 'model',
        usage: {
          inputTokens,
          outputTokens,
          cacheReadTokens: options.cacheReadTokens ?? 0,
          cacheWriteTokens: 0,
          costUsd: options.costUsd,
        },
      },
    },
    { type: 'model.settled', data: { runId, outcome: options.outcome ?? 'completed' } },
  ]
}

function view(events: Omit<ReceivedEvent, 'meta'>[]) {
  return foldEvents(
    emptySessionView(),
    events.map((event, line) => ({ ...event, meta: { position: { line, index: 0 }, at: '2026-11-04T05:00:00Z' } })),
  )
}

describe('context usage', () => {
  it('uses the documented window for the exact model and supports a validated override', () => {
    expect(modelContextWindow('gpt-6-luna')).toBe(1_050_000)
    expect(modelContextWindow('custom-model')).toBeUndefined()
    expect(modelContextWindow('custom-model', '64000')).toBe(64000)
    for (const invalid of ['', 'NaN', 'Infinity', '-1', '0', '1.5']) {
      expect(modelContextWindow('custom-model', invalid)).toBeUndefined()
    }
  })
  it('has no usage before a completed model call', () => {
    expect(contextUsage(emptySessionView())).toBeUndefined()
    expect(contextUsage(view(modelRun('running', 100, 10).slice(0, -1)))).toBeUndefined()
  })

  it('shows the last model call instead of repeated prompts accumulated across the session', () => {
    const session = view([...modelRun('first', 1000, 200), ...modelRun('second', 1500, 100, { costUsd: 0.002 })])
    const latest = contextUsage(session)
    expect(usage(session).total.inputTokens).toBe(2500)
    expect(latest?.usedTokens).toBe(1600)
    expect(latest?.usage.inputTokens).toBe(1500)
    expect(latest?.modelId).toBe('test-model')
    expect(latest?.costUsd).toBe(0.002)
  })

  it('does not add cached input twice or invent unavailable reasoning and cost data', () => {
    const latest = contextUsage(view(modelRun('cached', 1000, 200, { cacheReadTokens: 800 })))
    expect(latest?.usedTokens).toBe(1200)
    expect(latest?.usage.inputTokenDetails.cacheReadTokens).toBe(800)
    expect(latest?.usage.outputTokenDetails.reasoningTokens).toBeUndefined()
    expect(latest?.costUsd).toBeUndefined()
  })

  it('keeps the last conversation usage when a newer compaction or failed run finishes', () => {
    const session = view([
      ...modelRun('conversation', 1000, 200),
      ...modelRun('summary', 4000, 500, { summary: true }),
      ...modelRun('failed', 5000, 100, { outcome: 'failed' }),
    ])
    expect(contextUsage(session)?.usedTokens).toBe(1200)
  })
})
