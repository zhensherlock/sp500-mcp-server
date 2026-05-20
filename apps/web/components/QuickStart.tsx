'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronDown, Copy, Radio } from 'lucide-react'
import { installMCP as installAntigravityMCP } from 'protocol-launcher/antigravity'
import { installMCP as installCherryStudioMCP } from 'protocol-launcher/cherry-studio'
import { installMCP as installCursorMCP } from 'protocol-launcher/cursor'
import { installMCP as installKiroMCP } from 'protocol-launcher/kiro'
import { installMCP as installLingmaMCP } from 'protocol-launcher/lingma'
import { installMCP as installQoderMCP } from 'protocol-launcher/qoder'
import { installMCP as installTraeMCP } from 'protocol-launcher/trae'
import { installMCP as installTraeChinaMCP } from 'protocol-launcher/trae-cn'
import { installMCP as installVSCodeMCP } from 'protocol-launcher/vscode'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useScrollStagger } from '@/hooks/useEntranceAnimation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { cn } from '@workspace/ui/lib/utils'

const mcpName = 'SP500-MCP'

const mcpClients = [
  { name: 'Cherry Studio', logo: '/client/cherry-studio.svg' },
  { name: 'Cursor', logo: '/client/cursor.svg' },
  { name: 'Trae', logo: '/client/trae.png' },
  { name: 'Trae China', logo: '/client/trae.png' },
  { name: 'Antigravity', logo: '/client/antigravity.png' },
  { name: 'Kiro', logo: '/client/kiro.svg' },
  { name: 'Qoder', logo: '/client/qoder.svg' },
  { name: 'Lingma', logo: '/client/lingma.png' },
  { name: 'Visual Studio Code', logo: '/client/vscode.svg' },
]

const transportLabels = {
  streamable: 'Streamable',
  sse: 'SSE',
  stdio: 'Stdio',
} as const

type Transport = keyof typeof transportLabels

function getOrigin() {
  if (typeof window === 'undefined') {
    return 'https://sp500-mcp.vercel.app'
  }

  return window.location.origin
}

function getEndpoint(transport: Transport, origin = getOrigin()) {
  if (transport === 'sse') {
    return `${origin}/sse`
  }

  return `${origin}/mcp`
}

const cherryStudioConfig = (mcpUrl: string) => ({
  mcpServers: {
    [mcpName]: {
      name: mcpName,
      description:
        'Empower your AI to read the U.S. stock market with real-time S&P 500 company data, precise search, and total visibility.',
      type: 'sse' as const,
      baseUrl: mcpUrl,
      provider: 'zhensherlock',
      providerUrl: getOrigin(),
      logoUrl: `${getOrigin()}/logo.png`,
      tags: ['S&P500'],
      timeout: 30,
    },
  },
})

const httpSseConfig = (mcpUrl: string) => ({
  name: mcpName,
  type: 'http' as const,
  url: mcpUrl,
})

const cursorConfig = (mcpUrl: string) => ({
  name: mcpName,
  type: 'sse' as const,
  url: mcpUrl,
})

function buildConfig(transport: Transport, origin = getOrigin()) {
  const endpoint = getEndpoint(transport, origin)

  if (transport === 'stdio') {
    return {
      mcpServers: {
        [mcpName]: {
          command: 'npx',
          args: ['-y', 'mcp-remote', endpoint],
        },
      },
    }
  }

  return {
    mcpServers: {
      [mcpName]: {
        transport,
        url: endpoint,
      },
    },
  }
}

function handleLaunch(clientName: string) {
  const sseUrl = getEndpoint('sse')
  const streamableUrl = getEndpoint('streamable')
  let url: string

  switch (clientName) {
    case 'Cherry Studio':
      url = installCherryStudioMCP(cherryStudioConfig(sseUrl))
      break
    case 'Cursor':
      url = installCursorMCP(cursorConfig(sseUrl))
      break
    case 'Visual Studio Code':
      url = installVSCodeMCP(httpSseConfig(streamableUrl))
      break
    case 'Trae':
      url = installTraeMCP(httpSseConfig(streamableUrl))
      break
    case 'Trae China':
      url = installTraeChinaMCP(httpSseConfig(streamableUrl))
      break
    case 'Lingma':
      url = installLingmaMCP(httpSseConfig(streamableUrl))
      break
    case 'Kiro':
      url = installKiroMCP(httpSseConfig(streamableUrl))
      break
    case 'Qoder':
      url = installQoderMCP(httpSseConfig(streamableUrl))
      break
    case 'Antigravity':
      url = installAntigravityMCP(httpSseConfig(streamableUrl))
      break
    default:
      return
  }

  window.location.href = url
}

function CodeBlock({
  onTransportChange,
  origin,
  transport,
}: {
  onTransportChange: (transport: Transport) => void
  origin: string
  transport: Transport
}) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const config = useMemo(() => JSON.stringify(buildConfig(transport, origin), null, 2), [origin, transport])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(config)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-code-border bg-code">
      <div className="flex h-13 items-center justify-between bg-code-header px-4">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-7 cursor-pointer rounded-4xl border-code-border bg-code-border px-3 text-xs font-extrabold text-code-foreground shadow-[inset_0_1px_0_rgb(255_255_255/8%)] transition-all hover:border-code-blue/50 hover:bg-code-border hover:text-code-foreground hover:shadow-[0_8px_18px_rgb(0_0_0/20%)] aria-expanded:border-code-blue/60"
            >
              {transportLabels[transport]}
              <ChevronDown data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-31.5 rounded-[14px] border-border bg-card p-1.5 shadow-(--shadow-card-strong)">
            <DropdownMenuRadioGroup
              value={transport}
              onValueChange={value => {
                onTransportChange(value as Transport)
                setOpen(false)
              }}
            >
              {Object.entries(transportLabels).map(([value, label]) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  className="cursor-pointer rounded-[9px] text-xs font-bold"
                >
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer rounded-4xl border border-code-border/80 bg-code-border/55 text-code-foreground shadow-[inset_0_1px_0_rgb(255_255_255/7%)] transition-all hover:border-code-blue/50 hover:bg-code-border hover:text-code-foreground"
          onClick={handleCopy}
          aria-label={copied ? 'Configuration copied' : 'Copy configuration'}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      <pre className="min-h-35.5 overflow-x-auto px-5 py-4 font-mono text-[13px] leading-[1.35] text-code-foreground">
        {config.split('\n').map((line, index) => (
          <span key={`${line}-${index}`} className="block">
            <span className="mr-5 select-none text-code-line">{index + 1}</span>
            <span className={line.includes('mcpServers') || line.includes(mcpName) ? 'text-code-blue' : undefined}>
              {line}
            </span>
          </span>
        ))}
      </pre>
    </div>
  )
}

export default function QuickStart() {
  const [transport, setTransport] = useState<Transport>('streamable')
  const [origin, setOrigin] = useState('https://sp500-mcp.vercel.app')
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useScrollStagger(sectionRef, '[data-quickstart-entrance]', {
    stagger: 0.1,
    y: 26,
  })

  useEffect(() => {
    setOrigin(window.location.origin)
    setMounted(true)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="quick-start"
      className="bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-blue)_55%,var(--surface)_100%)] px-6 py-16 xl:px-0"
    >
      <div className="mx-auto grid max-w-312 gap-6 lg:grid-cols-2">
        <Card
          className="animate-on-scroll rounded-[28px] border-border py-0 shadow-(--shadow-card-strong)"
          data-quickstart-entrance
        >
          <CardHeader className="px-7 pt-7">
            <CardTitle className="font-heading text-[28px] font-extrabold">Quick Start</CardTitle>
            <CardDescription className="text-base">Choose your AI client to get started in seconds.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-7 px-7 pb-7">
            <div className="grid grid-cols-2 gap-3">
              {mcpClients.map((client, index) => {
                const spansFullRow = mcpClients.length % 2 === 1 && index === mcpClients.length - 1

                return (
                  <Button
                    key={client.name}
                    type="button"
                    variant="outline"
                    className={cn(
                      'group/client relative h-15 cursor-pointer justify-start gap-2.5 overflow-hidden rounded-2xl border-border/80 bg-[linear-gradient(180deg,var(--card)_0%,var(--surface-blue)_100%)] px-3 text-left text-sm font-bold shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-[linear-gradient(180deg,var(--surface-blue)_0%,var(--card)_100%)] hover:shadow-[var(--shadow-blue)] active:translate-y-0',
                      spansFullRow && 'col-span-2 justify-center text-[15px]',
                    )}
                    onClick={() => handleLaunch(client.name)}
                    disabled={!mounted}
                  >
                    <Image src={client.logo} alt="" width={24} height={24} className="size-6 shrink-0 object-contain" />
                    <span className={cn('min-w-0 flex-1 truncate pr-5', spansFullRow && 'flex-none pr-0')}>
                      {client.name}
                    </span>
                    <ArrowRight
                      data-icon="inline-end"
                      className="absolute right-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover/client:translate-x-0 group-hover/client:opacity-100"
                    />
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card
          className="animate-on-scroll rounded-[28px] border-border py-0 shadow-(--shadow-card-strong)"
          data-quickstart-entrance
        >
          <CardHeader className="px-7 pt-7">
            <CardTitle className="font-heading text-[28px] font-extrabold">Configuration</CardTitle>
            <CardDescription className="text-base">Add the following to your MCP client config.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 px-7 pb-7">
            <div>
              <CodeBlock transport={transport} origin={origin} onTransportChange={setTransport} />
            </div>
            <div className="flex min-h-11.5 items-center gap-3 rounded-[14px] border border-success-soft bg-success-soft px-4 text-sm font-semibold text-success">
              <Radio className="size-4" aria-hidden="true" />
              Same {transportLabels[transport]} config generated by Quick Start.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
