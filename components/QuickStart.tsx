'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { useScrollStagger } from '@/hooks/useEntranceAnimation'
import { installMCP as installCherryStudioMCP } from 'protocol-launcher/cherry-studio'
import { installMCP as installCursorMCP } from 'protocol-launcher/cursor'
import { installMCP as installTraeMCP } from 'protocol-launcher/trae'
import { installMCP as installTraeChinaMCP } from 'protocol-launcher/trae-cn'
import { installMCP as installLingmaMCP } from 'protocol-launcher/lingma'
import { installMCP as installKiroMCP } from 'protocol-launcher/kiro'
import { installMCP as installQoderMCP } from 'protocol-launcher/qoder'
import { installMCP as installVSCodeMCP } from 'protocol-launcher/vscode'
import { installMCP as installAntigravityMCP } from 'protocol-launcher/antigravity'

const mcpName = 'SP500-MCP'

function getMcpUrl() {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/mcp`
}

const cherryStudioConfig = (mcpUrl: string) => ({
  mcpServers: {
    [mcpName]: {
      name: mcpName,
      description:
        'Empower your AI to read the U.S. stock market — real-time S&P 500 company data, precise search, total visibility.',
      type: 'streamableHttp' as const,
      baseUrl: mcpUrl,
      provider: 'zhensherlock',
      providerUrl: window.location.origin,
      logoUrl: `${window.location.origin}/logo.svg`,
      tags: ['S&P500'],
      timeout: 30,
    },
  },
})

const stdioHttpConfig = (mcpUrl: string) => ({
  name: mcpName,
  type: 'http' as const,
  url: mcpUrl,
})

const cursorConfig = (mcpUrl: string) => ({
  name: mcpName,
  type: 'streamable_http' as const,
  url: mcpUrl,
})

const mcpConfig = (mcpUrl: string) => ({
  mcpServers: {
    [mcpName]: {
      transport: 'streamable-http',
      url: mcpUrl,
    },
  },
})

const mcpConfigJson = (mcpUrl: string) => JSON.stringify(mcpConfig(mcpUrl), null, 2)

function handleLaunch(clientName: string) {
  const mcpUrl = getMcpUrl()
  let url: string
  switch (clientName) {
    case 'Cherry Studio':
      url = installCherryStudioMCP(cherryStudioConfig(mcpUrl))
      break
    case 'Cursor':
      url = installCursorMCP(cursorConfig(mcpUrl))
      break
    case 'Visual Studio Code':
      url = installVSCodeMCP(stdioHttpConfig(mcpUrl))
      break
    case 'Trae':
      url = installTraeMCP(stdioHttpConfig(mcpUrl))
      break
    case 'Trae China':
      url = installTraeChinaMCP(stdioHttpConfig(mcpUrl))
      break
    case 'Lingma':
      url = installLingmaMCP(stdioHttpConfig(mcpUrl))
      break
    case 'Kiro':
      url = installKiroMCP(stdioHttpConfig(mcpUrl))
      break
    case 'Qoder':
      url = installQoderMCP(stdioHttpConfig(mcpUrl))
      break
    case 'Antigravity':
      url = installAntigravityMCP(stdioHttpConfig(mcpUrl))
      break
    default:
      return
  }
  console.log('url', url)
  window.location.href = url
}

const mcpClients = [
  { name: 'Cherry Studio', logo: '/client/cherry-studio.svg' },
  { name: 'Cursor', logo: '/client/cursor.svg' },
  { name: 'Visual Studio Code', logo: '/client/vscode.svg' },
  { name: 'Trae', logo: '/client/trae.png' },
  { name: 'Trae China', logo: '/client/trae.png' },
  { name: 'Antigravity', logo: '/client/antigravity.png' },
  { name: 'Kiro', logo: '/client/kiro.svg' },
  { name: 'Qoder', logo: '/client/qoder.svg' },
  { name: 'Lingma', logo: '/client/lingma.png' },
]

function CopyButton({ mcpUrl }: { mcpUrl: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mcpConfigJson(mcpUrl))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-opacity ${
        copied ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
      }`}
      aria-live="polite"
      aria-label={copied ? 'Configuration copied to clipboard' : 'Copy configuration to clipboard'}
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
  )
}

export default function QuickStart() {
  const quickStartRef = useRef<HTMLDivElement>(null)
  useScrollStagger(quickStartRef, '.client-button, .config-block', { stagger: 0.08, y: 20 })
  const [mcpUrl, setMcpUrl] = useState('')

  useEffect(() => {
    setMcpUrl(getMcpUrl())
  }, [])

  return (
    <section ref={quickStartRef} className="py-24 px-6 bg-card border-t border-b border-border">
      <div className="max-w-300 mx-auto">
        <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] font-bold tracking-tight mb-4 text-foreground">Quick Start</h2>
        <p className="text-base text-muted-foreground max-w-[55ch] leading-relaxed">
          Add S&P 500 MCP to your favorite AI assistant with one click.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mt-8">
          {mcpClients.map(client => (
            <button
              key={client.name}
              onClick={() => handleLaunch(client.name)}
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
            <CopyButton mcpUrl={mcpUrl} />
          </div>
          <div className="config-block animate-on-scroll bg-muted border border-border rounded-lg p-6 overflow-x-auto">
            <pre className="font-mono text-sm leading-relaxed text-foreground m-0 whitespace-pre">
              {mcpConfigJson(mcpUrl)}
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}
