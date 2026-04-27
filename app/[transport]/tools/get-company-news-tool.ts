import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { supabase } from "../utils/supabase";
import { getCompanySymbol, getSummary } from '@/app/[transport]/utils';

const getCompanyNewsParams = z.object({
  query: z.string().min(1),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
  limit: z.number().min(1).max(100).default(10),
});

export function registerGetCompanyNewsTool(mcpServer: McpServer) {
  mcpServer.registerTool(
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
        mcpServer,
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

      const { data } = await newsQuery;

      if (!data?.length) {
        const sentimentFilter = sentiment ? ` with ${sentiment} sentiment` : '';
        return {
          content: [
            { type: "text", text: `No news found for ${symbol}${sentimentFilter}.` },
          ],
        };
      }

      const summary = await getSummary({
        text: JSON.stringify({
          symbol,
          news: data || [],
        }),
        mcpServer,
      })

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              symbol,
              news: data || [],
              summary,
            }),
          },
        ],
      };
    }
  );
}
