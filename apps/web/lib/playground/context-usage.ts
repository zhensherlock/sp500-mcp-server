import type { LanguageModelUsage } from 'ai'
import { runs, type SessionView } from 'eve/events'

export function contextUsage(view: SessionView) {
  // Summary/compaction runs belong to a change, not a conversational turn.
  // Session totals count repeated prompts and cannot represent the current context.
  const run = runs(view).findLast(run => run.turnId && run.outcome === 'completed' && run.usage)
  if (!run?.usage) return undefined

  const { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, costUsd } = run.usage
  const usedTokens = inputTokens + outputTokens
  const usage: LanguageModelUsage = {
    inputTokens,
    outputTokens,
    totalTokens: usedTokens,
    inputTokenDetails: { noCacheTokens: undefined, cacheReadTokens, cacheWriteTokens },
    // Eve's public usage events do not split output into text and reasoning.
    outputTokenDetails: { textTokens: undefined, reasoningTokens: undefined },
  }
  return { usedTokens, usage, modelId: run.modelId, costUsd }
}
