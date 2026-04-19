"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Database,
  Search,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const SoftAurora = dynamic(() => import("@/components/SoftAurora"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted" />
});

const mcpConfig = {
  mcpServers: {
    "sp500-mcp": {
      transport: "streamable-http",
      url: "https://sp500-mcp.vercel.app/mcp",
    },
  },
};

const mcpConfigJson = JSON.stringify(mcpConfig, null, 2);

const mcpClients = [
  { name: "Cherry Studio", logo: "/client/cherry-studio.svg" },
  { name: "Cursor", logo: "/client/cursor.svg" },
  { name: "Visual Studio Code", logo: "/client/vscode.svg" },
  { name: "Trae", logo: "/client/trae.png" },
  { name: "Trae China", logo: "/client/trae.png" },
  { name: "Antigravity", logo: "/client/antigravity.png" },
  { name: "Kiro", logo: "/client/kiro.svg" },
  { name: "Qoder", logo: "/client/qoder.svg" },
  { name: "Lingma", logo: "/client/lingma.png" },
];

const features = [
  {
    icon: <Database size={24} strokeWidth={1.5} />,
    title: "Company Data",
    description:
      "Access comprehensive S&P 500 company information including financials, leadership, and business summaries.",
  },
  {
    icon: <Search size={24} strokeWidth={1.5} />,
    title: "Fuzzy Search",
    description:
      "Find companies by symbol, name, sector, or industry with intelligent fuzzy matching.",
  },
  {
    icon: <Zap size={24} strokeWidth={1.5} />,
    title: "Fast Integration",
    description:
      "Connect to any MCP-compatible AI assistant in seconds with our streamlined setup.",
  },
];

function CopyButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mcpConfigJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-opacity ${
        copied
          ? "bg-accent text-accent-foreground"
          : "bg-primary text-primary-foreground"
      }`}
      aria-live="polite"
      aria-label={copied ? "Configuration copied to clipboard" : "Copy configuration to clipboard"}
    >
      {copied ? (
        <>
          <Check size={14} strokeWidth={2} aria-hidden="true" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={14} strokeWidth={2} aria-hidden="true" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default function Home() {
  const { theme } = useTheme();

  const auroraColors = theme === "dark"
    ? { color1: "#7dd3fc", color2: "#38bdf8" }
    : { color1: "#ea580c", color2: "#f97316" };

  return (
    <>
      <Header />
      <main>
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <SoftAurora
              speed={0.3}
              scale={1.0}
              brightness={0.6}
              color1={auroraColors.color1}
              color2={auroraColors.color2}
              noiseFrequency={2}
              noiseAmplitude={0.7}
              bandHeight={0.4}
              bandSpread={1.5}
              octaveDecay={0.12}
              layerOffset={0.3}
              colorSpeed={0.5}
              enableMouseInteraction={true}
              mouseInfluence={0.15}
            />
          </div>
          <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,oklch(0.98_0.002_240/0.85)_0%,oklch(0.98_0.002_240/0.7)_50%,oklch(0.98_0.002_240/0.9)_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,oklch(0.15_0.005_265_/_0.7)_0%,oklch(0.15_0.005_265_/_0.5)_50%,oklch(0.15_0.005_265_/_0.8)_100%)]" />
          <div className="relative z-20 text-center px-6 py-16 max-w-250">
            <h1 className="text-[clamp(3rem,8vw,5rem)] font-bold tracking-tight leading-none mb-6 text-foreground">
              S&P 500 MCP
            </h1>
            <p className="text-[clamp(1.5rem,4vw,2rem)] leading-relaxed text-muted-foreground max-w-[80ch] mx-auto mb-12">
              Give your AI assistants access to real-time S&P 500 company data.
              Search by symbol, name, sector, or industry
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-2xl font-semibold font-mono text-foreground">500</div>
                <div className="text-sm text-muted-foreground mt-1">Companies</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-semibold font-mono text-foreground">1957</div>
                <div className="text-sm text-muted-foreground mt-1">Established</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-semibold font-mono text-foreground">MCP</div>
                <div className="text-sm text-muted-foreground mt-1">Protocol</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-300 mx-auto">
            <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] font-bold tracking-tight mb-4 text-foreground">
              Everything you need
            </h2>
            <p className="text-base text-muted-foreground max-w-[55ch] leading-relaxed">
              A complete data layer for building financial AI applications.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-12">
              {features.map((feature) => (
                <div key={feature.title} className="p-6 bg-card border border-border rounded-xl">
                  <div className="w-12 h-12 flex items-center justify-center bg-accent rounded-lg mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6 bg-card border-t border-b border-border">
          <div className="max-w-300 mx-auto">
            <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] font-bold tracking-tight mb-4 text-foreground">
              Quick Start
            </h2>
            <p className="text-base text-muted-foreground max-w-[55ch] leading-relaxed">
              Add S&P 500 MCP to your favorite AI assistant with one click.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-8">
              {mcpClients.map((client) => (
                <button
                  key={client.name}
                  className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg cursor-pointer transition-colors hover:border-primary hover:bg-accent no-underline text-foreground"
                >
                  <img src={client.logo} alt="" className="w-8 h-8 object-contain shrink-0" />
                  <span className="text-[15px] font-medium text-foreground">{client.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-between mb-4 max-sm:flex-col max-sm:items-start max-sm:gap-3">
                <span className="text-sm font-semibold text-foreground">Configuration</span>
                <CopyButton />
              </div>
              <div className="bg-muted border border-border rounded-lg p-6 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed text-foreground m-0 whitespace-pre">{mcpConfigJson}</pre>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
