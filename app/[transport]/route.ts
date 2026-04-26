import { createMcpHandler } from "mcp-handler";
import { registerSearchCompaniesTool, registerGetCompanyInfoTool, registerGetCompanyNewsTool, registerGetCompanyOfficersTool, registerGetCompanyFilingsTool } from "./tools";
// import { NextRequest } from 'next/server';

const handler = createMcpHandler(
  async (server) => {
    registerSearchCompaniesTool(server);
    registerGetCompanyInfoTool(server);
    registerGetCompanyNewsTool(server);
    registerGetCompanyOfficersTool(server);
    registerGetCompanyFilingsTool(server);
  },
  {
    serverInfo: {
      name: "SP500-mcp",
      version: "1.0.0",
    },
    capabilities: {
      tools: {},
    }
  },
  {
    basePath: "/",
    verboseLogs: false,
    maxDuration: Number(process.env.MCP_MAX_DURATION) || 60,
    disableSse: false,
    redisUrl: process.env.REDIS_URL,
  }
);

export { handler as GET, handler as POST, handler as DELETE };

// export async function POST(request: NextRequest) {
//   const body = await request.json();
//
//   if (body['method'] === 'initialize') {
//     body.params = body.params || {};
//     body.params.capabilities = body.params.capabilities || {};
//     body.params.capabilities.elicitation = { form: {} };
//   }
//
//   return handler(new NextRequest(request.url, {
//     method: 'POST',
//     headers: request.headers,
//     body: JSON.stringify(body),
//   }));
// }
