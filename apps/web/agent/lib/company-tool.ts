import type { WorkflowToolContext, ToolModelOutput } from 'eve/tools'
import {
  appResourceUri,
  companyChoice,
  type CompanyToolName,
  type McpAppToolOutput,
  type McpInputResponse,
} from '@/lib/mcp-apps/contracts'
import { callMcpTool } from '@/lib/mcp-apps/protocol'

async function requestTool(
  name: CompanyToolName,
  input: Record<string, unknown>,
  continuation?: { requestState?: string; inputResponses: Record<string, McpInputResponse> },
) {
  'use step'
  const started = Date.now()
  const response = await callMcpTool(name, input, continuation)
  return { ...response, elapsedMs: Date.now() - started }
}

export async function runCompanyTool(
  name: CompanyToolName,
  input: Record<string, unknown>,
  ctx: WorkflowToolContext,
): Promise<McpAppToolOutput> {
  let response = await requestTool(name, input)
  let elapsedMs = response.elapsedMs
  for (let attempt = 0; response.status === 'input_required'; attempt++) {
    if (attempt >= 5) throw new Error('The MCP server requested too many company selections. Please refine your query.')
    const { pending } = response
    const inputResponses: Record<string, McpInputResponse> = {}
    for (const [key, request] of Object.entries(pending.inputRequests)) {
      const choice = companyChoice(request)
      const answer = await ctx.ask({
        prompt: request.params.message,
        options: choice.options.map((label, index) => ({ id: String(index), label })),
        allowFreeform: false,
      })
      if (answer.status !== 'answered' || answer.optionId === undefined)
        throw new Error('Company selection was cancelled.')
      const selected = choice.options[Number(answer.optionId)]
      if (!selected) throw new Error('Invalid company selection.')
      inputResponses[key] = { action: 'accept', content: { [choice.field]: selected } }
    }
    response = await requestTool(name, input, { requestState: pending.requestState, inputResponses })
    elapsedMs += response.elapsedMs
  }
  return {
    kind: 'sp500-mcp-app',
    toolName: name,
    resourceUri: appResourceUri(name),
    result: response.result,
    elapsedMs,
  }
}

export function toModelOutput(output: McpAppToolOutput): ToolModelOutput {
  return {
    type: 'json',
    value: { isError: output.result.isError ?? false, data: output.result.structuredContent ?? output.result.content },
  }
}
