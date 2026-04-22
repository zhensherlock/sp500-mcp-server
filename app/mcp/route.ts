import { createMcpHandler } from "mcp-handler";
import { registerSearchCompaniesTool, registerGetCompanyInfoTool, registerGetCompanyNewsTool } from "./tools";

const handler = createMcpHandler(
  async (server) => {
    registerSearchCompaniesTool(server);
    registerGetCompanyInfoTool(server);
    registerGetCompanyNewsTool(server);
  },
  {},
  {
    basePath: "",
    verboseLogs: false,
    maxDuration: Number(process.env.MCP_MAX_DURATION) || 60,
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
