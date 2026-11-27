import { z } from 'zod'

const continuation = z.object({
  taskId: z.uuid(),
  contextId: z.uuid(),
  proof: z.string().regex(/^[\w-]{43}$/),
})

export const a2aMessageSchema = z.union([
  z.strictObject({ text: z.string().trim().min(1).max(512), continuation: continuation.optional() }),
  z.strictObject({ continuation }),
])

const step = z.enum(['running', 'completed', 'waiting', 'empty', 'unavailable'])
export const a2aProgressSchema = z.object({
  company: step.optional(),
  financials: step.optional(),
  news: step.optional(),
})

const a2aReply = z.object({
  text: z.string(),
  choices: z.array(z.string()).optional(),
  progress: a2aProgressSchema.optional(),
  continuation: continuation.optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const a2aReplySchema = z.union([
  a2aReply.extend({ running: z.literal(true), continuation, failed: z.undefined().optional() }),
  a2aReply.extend({ running: z.undefined().optional(), failed: z.literal(true).optional() }),
])

export type A2AContinuation = z.infer<typeof continuation>
export type A2AProgress = z.infer<typeof a2aProgressSchema>
export type A2AReply = z.infer<typeof a2aReplySchema>
