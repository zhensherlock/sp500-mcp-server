import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { supabase } from "../utils/supabase";
import { getCompanySymbol } from '@/app/[transport]/utils';

const getCompanyNewsParams = z.object({
  query: z.string().min(1),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
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
      const { query, sentiment, limit } = params;

      const symbol = await getCompanySymbol({
        query,
        mcpServer: server,
      })

      let newsQuery = supabase
        .from("company_news_sentiment")
        .select("symbol, title, summary, provider, pubDate, thumbnail, url, lm_level, lm_score1, lm_score2, lm_sentiment")
        .eq("symbol", symbol)
        .order("pubDate", { ascending: false })
        .limit(limit);

      if (sentiment) {
        newsQuery = newsQuery.eq("lm_sentiment", sentiment);
      }

      const { data: newsData } = await newsQuery;

      if (!newsData?.length) {
        const sentimentFilter = sentiment ? ` with ${sentiment} sentiment` : '';
        return {
          content: [
            { type: "text", text: `No news found for ${symbol}${sentimentFilter}.` },
          ],
        };
      }

      const news = (newsData || []).map((row: NewsRow) => ({
        title: row.title || "",
        summary: row.summary || "",
        provider: row.provider || "",
        pubDate: row.pubDate || "",
        sentiment: row.lm_sentiment || "",
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
              news,
            }),
          },
        ],
      };
    }
  );
}
