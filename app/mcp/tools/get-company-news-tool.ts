import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { supabase } from "../utils/supabase";

const getCompanyNewsParams = z.object({
  query: z.string().min(1),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
  days: z.number().min(1).max(365).default(7),
  limit: z.number().min(1).max(100).default(10),
});

interface NewsRow {
  symbol: string;
  title: string | null;
  summary: string | null;
  provider: string | null;
  pubDate: string | null;
  thumbnail: string | null;
  url: string | null;
  lm_level: number | null;
  lm_score1: number | null;
  lm_score2: number | null;
  lm_sentiment: string | null;
}

export function registerGetCompanyNewsTool(server: McpServer) {
  server.registerTool(
    "get_company_news",
    {
      title: "Get Company News",
      description: "Get recent company news with sentiment analysis, supports filtering by symbol, sentiment, and time range.",
      inputSchema: getCompanyNewsParams,
    },
    async (params: z.infer<typeof getCompanyNewsParams>) => {
      const { query, sentiment, days, limit } = params;

      // Step 1: Resolve query to stock symbol via company_info table
      const searchPattern = `%${query}%`;
      const { data: companyData, error: companyError } = await supabase
        .from("company_info")
        .select("symbol")
        .or(`symbol.ilike.${searchPattern},shortName.ilike.${searchPattern},longName.ilike.${searchPattern}`)
        .single();

      if (companyError) {
        return {
          content: [
            { type: "text", text: `Error getting company news: ${companyError.message}` },
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

      // Step 2: Calculate date range
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      const dateFromStr = dateFrom.toISOString().split("T")[0];

      // Step 3: Build query for news with optional sentiment filter
      let newsQuery = supabase
        .from("company_news_sentiment")
        .select("symbol, title, summary, provider, pubDate, thumbnail, url, lm_level, lm_score1, lm_score2, lm_sentiment")
        .eq("symbol", symbol)
        .gte("pubDate", dateFromStr)
        .order("pubDate", { ascending: false })
        .limit(limit);

      if (sentiment) {
        newsQuery = newsQuery.eq("lm_sentiment", sentiment);
      }

      const { data: newsData, error: newsError } = await newsQuery;

      if (newsError) {
        return {
          content: [
            { type: "text", text: `Error getting company news: ${newsError.message}` },
          ],
        };
      }

      const newsItems = (newsData || []).map((row: NewsRow) => ({
        title: row.title || "",
        summary: row.summary || "",
        provider: row.provider || "",
        pubDate: row.pubDate || "",
        sentiment: row.lm_sentiment || "neutral",
        url: row.url || "",
        thumbnail: row.thumbnail || "",
        lm_level: row.lm_level || 0,
        lm_score1: row.lm_score1 || 0,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              symbol,
              news: newsItems,
            }),
          },
        ],
      };
    }
  );
}
