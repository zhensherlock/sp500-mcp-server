import { z } from "zod";
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

export function registerSearchCompaniesTool(server: any) {
  server.registerTool(
    "search_companies",
    {
      title: "Search Companies",
      description: "模糊搜索公司(快速定位工具)，返回匹配公司的精简信息。用户搜索后可得到 symbol，再调用 get_company_info 获取完整信息。",
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
                prompt: "请告诉我您想查询哪家企业？",
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