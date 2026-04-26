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

export function registerSearchCompaniesTool(mcpServer: McpServer) {
  mcpServer.registerTool(
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
        `symbol.ilike.${searchPattern},shortName.ilike.${searchPattern},longName.ilike.${searchPattern}`
      );

      const { data } = await queryBuilder.limit(limit);

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

      if (mcpServer.server.getClientCapabilities()?.elicitation) {
        await mcpServer.server.elicitInput({
          mode: "form",
          message: "Which company would you like to query?",
          requestedSchema: {
            type: "object",
            properties: {
              companyName: {
                type: "string",
                title: "company name",
                enum: data.map(item => item.longName),
              },
            },
            required: ["companyName"]
          }
        });
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                companies,
              },
            ),
          },
          {
            type: "text",
            text: "Which company would you like to query?",
          },
        ],
      };
    }
  );
}
