import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { supabase } from "../utils/supabase";
import { getCompanySymbol } from '@/app/[transport]/utils';

const getCompanyOfficersParams = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(20),
});

interface OfficerRow {
  name: string | null;
  age: number | null;
  title: string | null;
  totalPay: number | null;
}

export function registerGetCompanyOfficersTool(server: McpServer) {
  server.registerTool(
    "get_company_officers",
    {
      title: "Get Company Officers",
      description: "Get company executive officers and their compensation info, supports filtering by symbol",
      inputSchema: getCompanyOfficersParams,
    },
    async (params: z.infer<typeof getCompanyOfficersParams>) => {
      const { query, limit } = params;

      const symbol = await getCompanySymbol({
        query,
        mcpServer: server,
      })

      const { data: officersData } = await supabase
        .from("company_officers")
        .select("name, age, title, totalPay")
        .eq("symbol", symbol)
        .order("totalPay", { ascending: false })
        .limit(limit);

      if (!officersData?.length) {
        return {
          content: [
            { type: "text", text: `No officers found for ${symbol}.` },
          ],
        };
      }

      const officers = (officersData || []).map((row: OfficerRow) => ({
        name: row.name || "",
        age: row.age,
        title: row.title || "",
        totalPay: row.totalPay,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              symbol,
              officers,
            }),
          },
        ],
      };
    }
  );
}
