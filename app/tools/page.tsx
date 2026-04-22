import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { tools } from "./data";

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