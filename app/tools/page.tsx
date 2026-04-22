import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";

const tools = [
  {
    name: "search_companies",
    description:
      "Fuzzy search for companies by symbol, name, sector, or industry. Returns concise company information. Use symbol to call get_company_info for full details.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Search keyword for fuzzy matching against symbol, name, sector, or industry",
      },
      {
        name: "sector",
        type: "string",
        required: false,
        description: "Filter by sector (e.g., Technology, Healthcare)",
      },
      {
        name: "industry",
        type: "string",
        required: false,
        description: "Filter by industry",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Maximum number of results to return (1-20, default: 5)",
      },
    ],
    returns: `{
  "companies": [
    {
      "symbol": "AAPL",
      "shortName": "Apple Inc.",
      "longName": "Apple Inc.",
      "sector": "Technology",
      "industry": "Consumer Electronics"
    }
  ],
  "prompt": "Which company would you like to query?"
}`,
  },
  {
    name: "get_company_info",
    description:
      "Get complete company basic information including financials, leadership, address, and business summary. Supports both symbol and company name queries.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Company symbol (e.g., AAPL) or company name (e.g., Apple)",
      },
    ],
    returns: `{
  "symbol": "AAPL",
  "shortName": "Apple Inc.",
  "longName": "Apple Inc.",
  "displayName": "Apple Inc.",
  "quoteType": "EQUITY",
  "address": "One Apple Park Way",
  "city": "Cupertino",
  "zip": "95014",
  "country": "United States",
  "phone": "+1-408-996-1010",
  "website": "https://www.apple.com",
  "irWebsite": "https://investor.apple.com",
  "sector": "Technology",
  "sectorKey": "TECHNOLOGY",
  "industry": "Consumer Electronics",
  "industryKey": "CONSUMER_ELECTRONICS",
  "longBusinessSummary": "Apple Inc. designs, manufactures, and markets smartphones...",
  "fullTimeEmployees": 164000
}`,
  },
];

export default function ToolsPage() {
  return (
    <>
      <Header />
      <main>
        <div className="pt-24 pb-12 px-6 text-center border-b border-border">
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-normal mb-4 text-foreground">
            MCP Tools
          </h1>
          <p className="text-[17px] text-muted-foreground max-w-[55ch] mx-auto leading-7">
            Available tools for querying S&amp;P 500 company data through the MCP
            protocol.
          </p>
        </div>
        <div className="max-w-5xl mx-auto pt-12 pb-24 px-6">
          <div className="space-y-6">
            {tools.map((tool) => (
              <ToolCard
                key={tool.name}
                name={tool.name}
                description={tool.description}
                params={tool.params}
                returns={tool.returns}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}