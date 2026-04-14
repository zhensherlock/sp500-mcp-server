import { createMcpHandler } from "mcp-handler";
import { registerSearchCompaniesTool, registerGetCompanyInfoTool } from "./tools";

const handler = createMcpHandler(
  async (server) => {
    registerSearchCompaniesTool(server);
    registerGetCompanyInfoTool(server);
  },
  {},
  {
    basePath: "",
    verboseLogs: false,
    maxDuration: 60,
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
