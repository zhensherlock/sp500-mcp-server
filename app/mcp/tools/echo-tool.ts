import { z } from "zod";

export function registerEchoTool(server: any) {
  server.registerTool(
    "echo",
    {
      title: "echo",
      description: "Echo a message",
      inputSchema: z.object({
        message: z.string().min(1).max(100),
      }),
    },
    async ({ message }: { message: string }) => ({
      content: [{ type: "text", text: `Tool echo: ${message}` }],
    })
  );
}
