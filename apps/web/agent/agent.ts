import { defineAgent } from 'eve'
import { openai } from 'eve/models/openai'
import { createOpenAI } from '@ai-sdk/openai'
import { createModelFetch } from '@/lib/playground/model-fetch'

const modelName = process.env.OPENAI_MODEL ?? 'gpt-6-luna'
const modelFetch = createModelFetch(process.env.OPENAI_PROXY_URL)

export default defineAgent({
  model: modelFetch ? createOpenAI({ fetch: modelFetch }).responses(modelName) : openai(modelName),
  reasoning: 'medium',
  defaultTools: false,
  tool: false,
  limits: {
    sessionUsage: ({ window }) =>
      window.inputTokens - window.cacheReadTokens >= 200_000 || window.outputTokens >= 20_000,
  },
})
