"use client";

import SoftAurora from "@/components/SoftAurora";
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
      className={`copy-button ${copied ? "copied" : ""}`}
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
        <section className="hero">
          <div className="hero-aurora">
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
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1 className="hero-title">S&P 500 MCP</h1>
            <p className="hero-subtitle">
              Give your AI assistants access to real-time S&P 500 company data.
              Search by symbol, name, sector, or industry — powered by the
              Model Context Protocol.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">500</div>
                <div className="hero-stat-label">Companies</div>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <div className="hero-stat-value">1957</div>
                <div className="hero-stat-label">Established</div>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <div className="hero-stat-value">MCP</div>
                <div className="hero-stat-label">Protocol</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <h2 className="section-title">Everything you need</h2>
            <p className="section-subtitle">
              A complete data layer for building financial AI applications.
            </p>
            <div className="features-grid">
              {features.map((feature) => (
                <div key={feature.title} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section quickstart-section">
          <div className="section-inner">
            <h2 className="section-title">Quick Start</h2>
            <p className="section-subtitle">
              Add S&P 500 MCP to your favorite AI assistant with one click.
            </p>
            <div className="clients-grid">
              {mcpClients.map((client) => (
                <button key={client.name} className="client-button">
                  <img src={client.logo} alt="" className="client-logo" />
                  <span className="client-name">{client.name}</span>
                </button>
              ))}
            </div>

            <div className="config-section">
              <div className="config-header">
                <span className="config-label">Configuration</span>
                <CopyButton />
              </div>
              <div className="config-block">
                <pre className="config-code">{mcpConfigJson}</pre>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
