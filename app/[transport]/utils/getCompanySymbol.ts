import { searchCompanies } from '@/app/[transport]/utils';
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type Options = {
  query: string;
  mcpServer: McpServer;
}

export async function getCompanySymbol(options: Options): Promise<string> {
  const { query, mcpServer } = options;
  const capabilities = mcpServer.server.getClientCapabilities()
  const companies = await searchCompanies(query)

  if (!companies.success) {
    throw new Error(`No companies found matching "${query}". Please try a different company name or symbol.`)
  }

  if (capabilities?.elicitation) {
    const response = await mcpServer.server.elicitInput({
      mode: "form",
      message: "Which company would you like to query?",
      requestedSchema: {
        type: "object",
        properties: {
          companyName: {
            type: "string",
            title: "company name",
            enum: companies.data.map(item => item.symbol),
            enumNames: companies.data.map(item => item.longName),
          },
        },
        required: ["companyName"]
      }
    });
    if (response.action === "decline" || response.action === "cancel") {
      throw new Error('User cancelled the query')
    }

    return response.content?.companyName as string;
  } else {
    return companies.data[0].symbol;
  }
}
