import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { supabase } from "../utils/supabase";

const searchCompaniesParams = z.object({
  query: z.string().min(1),
  sector: z.string().optional(),
  industry: z.string().optional(),
  limit: z.number().int().min(1).max(20).default(5),
});

interface CompanyRow {
  symbol: string;
  shortName: string;
  longName: string;
  sector: string | null;
  industry: string | null;
}

export function registerSearchCompaniesTool(server: McpServer) {
  server.registerTool(
    "search_companies",
    {
      title: "Search Companies",
      description: "Fuzzy search for companies (quick lookup tool), returns concise info. Use symbol to call get_company_info for full details.",
      inputSchema: searchCompaniesParams,
    },
    async (params: z.infer<typeof searchCompaniesParams>) => {
      const { query, sector, industry, limit } = params;

      let queryBuilder = supabase
        .from("company_info")
        .select("symbol, shortName, longName, sector, industry");

      if (sector) {
        queryBuilder = queryBuilder.ilike("sector", `%${sector}%`);
      }
      if (industry) {
        queryBuilder = queryBuilder.ilike("industry", `%${industry}%`);
      }

      const searchPattern = `%${query}%`;
      queryBuilder = queryBuilder.or(
        `symbol.ilike.${searchPattern},shortName.ilike.${searchPattern},longName.ilike.${searchPattern},sector.ilike.${searchPattern},industry.ilike.${searchPattern}`
      );

      const { data, error } = await queryBuilder.limit(limit);

      if (error) {
        return {
          content: [
            { type: "text", text: `Error searching companies: ${error.message}` },
          ],
        };
      }

      if (!data) {
        return {
          content: [
            { type: "text", text: "No companies found" },
          ],
        };
      }

      const companies = (data as CompanyRow[]).map((row) => ({
        symbol: row.symbol,
        shortName: row.shortName,
        longName: row.longName,
        sector: row.sector || "",
        industry: row.industry || "",
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                companies,
                prompt: "Which company would you like to query?",
              },
            ),
          },
        ],
      };
    }
  );
}
