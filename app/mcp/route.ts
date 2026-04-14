import { createMcpHandler } from "mcp-handler";
import { registerEchoTool, registerSearchCompaniesTool, registerGetCompanyInfoTool } from "./tools";

const handler = createMcpHandler(
  async (server) => {
    registerEchoTool(server);
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
