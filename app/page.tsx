"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Database,
  Search,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { useState, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useHeroEntrance, useScrollStagger } from "@/hooks/useEntranceAnimation";

const SoftAurora = dynamic(() => import("@/components/SoftAurora"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />
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
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const quickStartRef = useRef<HTMLDivElement>(null);

  useHeroEntrance(heroRef);
  useScrollStagger(featuresRef, ".feature-card", { stagger: 0.15, y: 30 });
  useScrollStagger(quickStartRef, ".client-button, .config-block", { stagger: 0.08, y: 20 });

  const auroraColors = theme === "dark"
    ? { color1: "#f7f7f7", color2: "#e100ff" }
    : { color1: "#ea580c", color2: "#f97316" };

  return (
    <>
      <Header />
      <main>
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <SoftAurora
              speed={0.6}
              scale={1.5}
              brightness={1}
              color1={auroraColors.color1}
              color2={auroraColors.color2}
              noiseFrequency={2.5}
              noiseAmplitude={1}
              bandHeight={0.45}
              bandSpread={0.4}
              octaveDecay={0.1}
              layerOffset={0}
              colorSpeed={1}
              enableMouseInteraction={false}
              mouseInfluence={0.25}
            />
          </div>
          {/*<div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,oklch(0.98_0.002_240/0.85)_0%,oklch(0.98_0.002_240/0.7)_50%,oklch(0.98_0.002_240/0.9)_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,oklch(0.15_0.005_265/0.7)_0%,oklch(0.15_0.005_265/0.5)_50%,oklch(0.15_0.005_265/0.8)_100%)]" />*/}
          <div className="relative z-20 text-center px-6 py-16 max-w-250">
            <h1 className="hero-title animate-on-load text-[clamp(3rem,8vw,5rem)] font-bold tracking-tight leading-none mb-6 text-foreground">
              S&P 500 MCP
            </h1>
            <p className="hero-tagline animate-on-load text-[clamp(1.5rem,4vw,2rem)] leading-relaxed max-w-[80ch] mx-auto mb-12">
              <span className="text-foreground hero-chars">
                {"Give your AI assistants access to real-time S&P 500 company data. Search by symbol, name, sector, or industry".split("").map((char, i) => (
                  <span key={i} className="hero-char inline-block" style={{ opacity: 0 }}>{char === " " ? "\u00A0" : char}</span>
                ))}
              </span>
            </p>
            <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              <div className="hero-stat animate-on-load text-center">
                <div className="text-2xl font-semibold font-mono text-foreground">500</div>
                <div className="text-sm text-muted-foreground mt-1">Companies</div>
              </div>
              <div className="hero-divider animate-on-load w-px h-8 bg-border" />
              <div className="hero-stat animate-on-load text-center">
                <div className="text-2xl font-semibold font-mono text-foreground">1957</div>
                <div className="text-sm text-muted-foreground mt-1">Established</div>
              </div>
              <div className="hero-divider animate-on-load w-px h-8 bg-border" />
              <div className="hero-stat animate-on-load text-center">
                <div className="text-2xl font-semibold font-mono text-foreground">MCP</div>
                <div className="text-sm text-muted-foreground mt-1">Protocol</div>
              </div>
            </div>
          </div>
        </section>

        <section ref={featuresRef} className="py-24 px-6">
          <div className="max-w-300 mx-auto">
            <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] font-bold tracking-tight mb-4 text-foreground">
              Everything you need
            </h2>
            <p className="text-base text-muted-foreground max-w-[55ch] leading-relaxed">
              A complete data layer for building financial AI applications.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-12">
              {features.map((feature) => (
                <div key={feature.title} className="feature-card animate-on-scroll p-6 bg-card border border-border rounded-xl">
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

        <section ref={quickStartRef} className="py-24 px-6 bg-card border-t border-b border-border">
          <div className="max-w-300 mx-auto">
            <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] font-bold tracking-tight mb-4 text-foreground">
              Quick Start
            </h2>
            <p className="text-base text-muted-foreground max-w-[55ch] leading-relaxed">
              Add S&P 500 MCP to your favorite AI assistant with one click.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mt-8">
              {mcpClients.map((client) => (
                <button
                  key={client.name}
                  className="client-button animate-on-scroll flex items-center gap-3 p-4 bg-background border border-border rounded-lg cursor-pointer transition-colors hover:border-primary hover:bg-accent no-underline text-foreground"
                >
                  <Image src={client.logo} alt="" width={32} height={32} className="object-contain shrink-0" />
                  <span className="text-[15px] font-medium text-foreground">{client.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-between mb-4 max-sm:flex-col max-sm:items-start max-sm:gap-3">
                <span className="text-sm font-semibold text-foreground">Configuration</span>
                <CopyButton />
              </div>
              <div className="config-block animate-on-scroll bg-muted border border-border rounded-lg p-6 overflow-x-auto">
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
