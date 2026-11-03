import { defineWorkflowTool } from 'eve/tools'
import { companyTools, toolSchemas } from '@/lib/mcp-apps/contracts'
import { runCompanyTool, toModelOutput } from '../lib/company-tool'

export default defineWorkflowTool({
  description: companyTools.get_company_info.description,
  inputSchema: toolSchemas.get_company_info,
  async execute(input, ctx) {
    'use workflow'
    return await runCompanyTool('get_company_info', input, ctx)
  },
  toModelOutput,
})
