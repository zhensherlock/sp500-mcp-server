"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { useScrollStagger } from "@/hooks/useEntranceAnimation";

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

export default function QuickStart() {
  const quickStartRef = useRef<HTMLDivElement>(null);
  useScrollStagger(quickStartRef, ".client-button, .config-block", { stagger: 0.08, y: 20 });

  return (
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
  );
}