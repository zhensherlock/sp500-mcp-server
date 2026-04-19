import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { supabase } from "../utils/supabase";

const getCompanyInfoParams = z.object({
  query: z.string().min(1),
});

interface CompanyInfoRow {
  symbol: string;
  shortName: string;
  longName: string;
  displayName: string | null;
  quoteType: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  irWebsite: string | null;
  sector: string | null;
  sectorKey: string | null;
  industry: string | null;
  industryKey: string | null;
  longBusinessSummary: string | null;
  fullTimeEmployees: number | null;
}

export function registerGetCompanyInfoTool(server: McpServer) {
  server.registerTool(
    "get_company_info",
    {
      title: "Get Company Info",
      description: "Get complete company basic info, supports symbol and company name queries.",
      inputSchema: getCompanyInfoParams,
    },
    async (params: z.infer<typeof getCompanyInfoParams>) => {
      const { query } = params;

      const searchPattern = `%${query}%`;
      const { data, error } = await supabase
        .from("company_info")
        .select(
          "symbol, shortName, longName, displayName, quoteType, address, city, zip, country, phone, website, irWebsite, sector, sectorKey, industry, industryKey, longBusinessSummary, fullTimeEmployees"
        )
        .or(`symbol.ilike.${searchPattern},shortName.ilike.${searchPattern},longName.ilike.${searchPattern}`)
        .limit(1)
        .single();

      if (error) {
        return {
          content: [
            { type: "text", text: `Error getting company info: ${error.message}` },
          ],
        };
      }

      if (!data) {
        return {
          content: [
            { type: "text", text: "Company not found" },
          ],
        };
      }

      const row = data as CompanyInfoRow;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                symbol: row.symbol,
                shortName: row.shortName,
                longName: row.longName,
                displayName: row.displayName,
                quoteType: row.quoteType,
                address: row.address,
                city: row.city,
                zip: row.zip,
                country: row.country,
                phone: row.phone,
                website: row.website,
                irWebsite: row.irWebsite,
                sector: row.sector,
                sectorKey: row.sectorKey,
                industry: row.industry,
                industryKey: row.industryKey,
                longBusinessSummary: row.longBusinessSummary,
                fullTimeEmployees: row.fullTimeEmployees,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
