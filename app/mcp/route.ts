import { createMcpHandler } from "mcp-handler";
import { registerEchoTool } from "./tools";

// StreamableHttp server
const handler = createMcpHandler(
  async (server) => {
    registerEchoTool(server);
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
