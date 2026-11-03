import { z } from 'zod'
import { companyToolNameSchema, toolSchemas } from '@/lib/mcp-apps/contracts'
import { callMcpTool } from '@/lib/mcp-apps/protocol'
import { requirePlaygroundRequest } from '@/lib/playground/auth'

const requestSchema = z.object({
  name: companyToolNameSchema,
  arguments: z.record(z.string(), z.unknown()).default({}),
  continuation: z
    .object({
      requestState: z.string().optional(),
      inputResponses: z.record(
        z.string(),
        z.object({
          action: z.enum(['accept', 'decline', 'cancel']),
          content: z.record(z.string(), z.unknown()).optional(),
        }),
      ),
    })
    .optional(),
})

export async function POST(request: Request) {
  try {
    requirePlaygroundRequest(request)
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid tool request.' }, { status: 400 })
  const input = toolSchemas[parsed.data.name].safeParse(parsed.data.arguments)
  if (!input.success) return Response.json({ error: 'Invalid tool arguments.' }, { status: 400 })
  try {
    return Response.json(await callMcpTool(parsed.data.name, input.data, parsed.data.continuation, request.signal), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('Playground MCP call failed:', error)
    return Response.json({ error: 'The MCP tool request failed. Please retry.' }, { status: 502 })
  }
}
