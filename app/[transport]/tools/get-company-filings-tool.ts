import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { supabase } from "../utils/supabase";
import { getCompanySymbol } from '@/app/[transport]/utils';

const GetCompanyFilingsParams = z.object({
  query: z.string().min(1),
  filing_type: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export function registerGetCompanyFilingsTool(mcpServer: McpServer) {
  mcpServer.registerTool(
    "get_company_filings",
    {
      title: "Get Company Filings",
      description: "Get SEC filings history for a company, supports filtering by symbol, date range, and filing type",
      inputSchema: GetCompanyFilingsParams,
    },
    async (params: z.infer<typeof GetCompanyFilingsParams>) => {
      const { query, filing_type, start_date, end_date, limit } = params;

      const symbol = await getCompanySymbol({
        query,
        mcpServer,
      })

      let filingsQuery = supabase
        .from("company_filings")
        .select("filing_date, filing_type, title, edgarUrl")
        .eq("symbol", symbol);

      if (filing_type) {
        filingsQuery = filingsQuery.ilike("filing_type", `%${filing_type}%`);
      }

      if (start_date) {
        filingsQuery = filingsQuery.gte("filing_date", start_date);
      }
      if (end_date) {
        filingsQuery = filingsQuery.lte("filing_date", end_date);
      }

      const { data } = await filingsQuery
        .order("filing_date", { ascending: false })
        .limit(limit);

      if (!data?.length) {
        const filters = [
          filing_type && `filing type "${filing_type}"`,
          start_date && `after ${start_date}`,
          end_date && `before ${end_date}`,
        ].filter(Boolean).join(', ');
        const filterText = filters ? ` with ${filters}` : '';
        return {
          content: [
            { type: "text", text: `No filings found for ${symbol}${filterText}. Try adjusting the date range or filing type.` },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              symbol,
              filings: data || [],
            }),
          },
        ],
      };
    }
  );
}
