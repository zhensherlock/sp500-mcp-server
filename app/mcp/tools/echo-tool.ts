import { z } from "zod";
import { supabase } from "../utils/supabase";

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
    async ({ message }: { message: string }) => {
      // Example of using supabase here:
      // const { data, error } = await supabase.from('your_table').select('*');

      return {
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      };
    }
  );
}
