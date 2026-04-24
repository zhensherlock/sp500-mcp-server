import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { supabase } from "../utils/supabase";

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

      // First resolve query to a stock symbol via company_info
      const searchPattern = `%${query}%`;
      const { data: companyData, error: companyError } = await supabase
        .from("company_info")
        .select("symbol")
        .or(`symbol.ilike.${searchPattern},shortName.ilike.${searchPattern},longName.ilike.${searchPattern}`)
        .single();

      if (companyError) {
        return {
          content: [
            { type: "text", text: `Error getting company officers: ${companyError.message}` },
          ],
        };
      }

      if (!companyData) {
        return {
          content: [
            { type: "text", text: "Company not found" },
          ],
        };
      }

      const symbol = companyData.symbol;

      // Fetch officers filtered by symbol, ordered by totalPay descending
      const { data: officersData, error: officersError } = await supabase
        .from("company_officers")
        .select("name, age, title, totalPay")
        .eq("symbol", symbol)
        .order("totalPay", { ascending: false })
        .limit(limit);

      if (officersError) {
        return {
          content: [
            { type: "text", text: `Error getting company officers: ${officersError.message}` },
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