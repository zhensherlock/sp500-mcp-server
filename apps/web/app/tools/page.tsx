'use client'

import { useState } from 'react'
import {
  AppWindow,
  Brain,
  Check,
  MessageCircleQuestionMark,
  MousePointerClick,
  PanelTop,
  PanelsTopLeft,
  Route,
  Sparkles,
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ToolCard from '@/components/ToolCard'
import { ToolDetailsDialog } from '@/components/ToolTestDialog'
import { tools, type Tool } from './data'

const capabilities = [
  {
    label: 'Guided flows',
    caption: 'Ask',
    icon: Route,
    artworkIcon: MessageCircleQuestionMark,
    artworkLabel: 'Elicitation',
    captionIcon: Check,
    iconClassName: 'text-[#2563EB]',
    surfaceClassName: 'border-[#D9E9FA] bg-[#E8F1FF]',
    cardBorderClassName: 'border-[#D9E9FA]',
    artworkBorderClassName: 'border-[#BFDBFE]',
    pillWidthClassName: 'min-[520px]:w-[164px]',
  },
  {
    label: 'AI-assisted',
    caption: 'Think',
    icon: Brain,
    artworkIcon: Sparkles,
    artworkLabel: 'Sampling',
    captionIcon: Brain,
    iconClassName: 'text-[#16A34A]',
    surfaceClassName: 'border-[#DCFCE7] bg-[#E8F8EF]',
    cardBorderClassName: 'border-[#DCFCE7]',
    artworkBorderClassName: 'border-[#BBF7D0]',
    pillWidthClassName: 'min-[520px]:w-[174px]',
  },
  {
    label: 'Interactive UI',
    caption: 'Render',
    icon: PanelsTopLeft,
    artworkIcon: AppWindow,
    artworkLabel: 'MCP Apps',
    captionIcon: PanelTop,
    iconClassName: 'text-[#7C3AED]',
    surfaceClassName: 'border-[#E9D5FF] bg-[#F0EAFF]',
    cardBorderClassName: 'border-[#E9D5FF]',
    artworkBorderClassName: 'border-[#DDD6FE]',
    pillWidthClassName: 'min-[520px]:w-[176px]',
  },
]

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openTool = (tool: Tool) => {
    setSelectedTool(tool)
    setIsDialogOpen(true)
  }

  return (
    <>
      <Header />
      <main className="bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FBFF_55%,#FFFFFF_100%)] xl:min-h-290.5">
        <section className="px-6 py-14 sm:py-16 xl:px-0">
          <div className="mx-auto grid max-w-312 items-center gap-10 min-[960px]:grid-cols-[minmax(270px,0.72fr)_minmax(500px,1fr)] min-[960px]:gap-8 xl:grid-cols-[minmax(0,610px)_minmax(520px,1fr)] xl:gap-12">
            <div className="min-w-0">
              <h1 className="font-heading text-[clamp(3.125rem,9vw,4.25rem)] font-extrabold leading-[0.95] tracking-normal text-[#071A33] min-[960px]:text-[clamp(3rem,5.2vw,4rem)] xl:text-[68px]">
                MCP Tools
              </h1>
              <p className="mt-7 max-w-152.5 text-[clamp(1rem,2.3vw,1.25rem)] font-normal leading-[1.45] tracking-normal text-[#53657A] min-[960px]:max-w-[38ch] min-[960px]:text-[clamp(1rem,1.45vw,1.125rem)] xl:max-w-152.5 xl:text-[20px]">
                S&amp;P 500 data tools designed for richer MCP workflows: ask users for context, request model
                reasoning, and render interactive app views.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 min-[520px]:flex min-[520px]:flex-wrap min-[520px]:items-center min-[960px]:max-w-110 xl:max-w-none xl:gap-5">
                {capabilities.map(capability => {
                  const Icon = capability.icon
                  return (
                    <div
                      key={capability.label}
                      className={`${capability.pillWidthClassName} ${capability.surfaceClassName} flex h-11 w-full items-center rounded-full border px-2.5 text-[14px] font-extrabold leading-4.25 text-[#071A33]`}
                    >
                      <Icon className={`mr-2.25 size-4.5 shrink-0 ${capability.iconClassName}`} aria-hidden="true" />
                      {capability.label}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative min-w-0 overflow-hidden rounded-[30px] border border-[#DCE8F5] bg-white/85 p-6 shadow-[0_24px_46px_rgba(18,54,92,0.09)] sm:p-7.5 min-[960px]:min-h-82.5 xl:min-h-82.5">
              <div className="pointer-events-none absolute right-0 top-3 size-52.5 rounded-full bg-[radial-gradient(circle,#DBEAFE_0%,rgba(219,234,254,0)_70%)]" />
              <div className="relative">
                <h2 className="font-heading text-[clamp(1.5rem,2.7vw,1.6875rem)] font-extrabold leading-[1.18] text-[#071A33]">
                  Advanced MCP support
                </h2>
                <p className="mt-1.5 max-w-2xl text-[13px] font-normal leading-[1.42] text-[#53657A]">
                  Guided, model-assisted, and interactive market workflows.
                </p>
                <div className="mt-9 grid gap-3.5 sm:grid-cols-3 min-[960px]:gap-3 xl:gap-3.75">
                  {capabilities.map(capability => {
                    const ArtworkIcon = capability.artworkIcon
                    const CaptionIcon = capability.captionIcon
                    return (
                      <div
                        key={capability.artworkLabel}
                        className={`flex min-h-0 min-w-0 items-center gap-3 rounded-[20px] border bg-white p-4 text-left shadow-[0_12px_22px_rgba(18,54,92,0.07)] sm:min-h-36.5 sm:flex-col sm:items-start sm:gap-0 sm:p-4.5 min-[960px]:p-4 xl:p-4.5 ${capability.cardBorderClassName}`}
                      >
                        <div
                          className={`${capability.surfaceClassName} flex size-10 items-center justify-center rounded-xl`}
                        >
                          <ArtworkIcon className={`size-5.5 ${capability.iconClassName}`} aria-hidden="true" />
                        </div>
                        <h3 className="min-w-0 flex-1 truncate font-heading text-[16px] font-extrabold leading-5.5 text-[#071A33] sm:mt-3 sm:flex-none sm:text-[clamp(1rem,1.45vw,1.0625rem)]">
                          {capability.artworkLabel}
                        </h3>
                        <div
                          className={`ml-auto inline-flex h-7.5 max-w-full shrink-0 items-center rounded-full border px-2.25 text-[12px] font-extrabold leading-3.5 text-[#071A33] sm:ml-0 sm:mt-3 ${capability.surfaceClassName} ${capability.artworkBorderClassName}`}
                        >
                          <CaptionIcon
                            className={`mr-1.5 size-3.5 shrink-0 ${capability.iconClassName}`}
                            aria-hidden="true"
                          />
                          {capability.caption}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="my-10 px-6 xl:mt-7 xl:px-0">
          <div className="mx-auto max-w-312 xl:h-128">
            <div className="relative flex flex-wrap items-center gap-x-5 gap-y-3 xl:h-9">
              <h2 className="font-heading text-[24px] font-extrabold leading-7.75 text-[#071A33] xl:absolute xl:left-0 xl:top-1/2 xl:-translate-y-1/2">
                Available tools
              </h2>
              <p className="text-[15px] font-medium leading-4.5 text-[#53657A] xl:absolute xl:left-49 xl:top-1/2 xl:-translate-y-1/2">
                Select a tool to view inputs, example output, and run a Test Call.
              </p>
              <div className="ml-auto flex h-9 w-fit items-center rounded-full border border-[#DCE8F5] bg-white px-3.5 text-[13px] font-extrabold leading-4 text-[#071A33] xl:absolute xl:right-0 xl:top-1/2 xl:ml-0 xl:-translate-y-1/2">
                <MousePointerClick className="mr-2 size-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
                Click for details
              </div>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-[612px_612px] xl:gap-x-6 xl:gap-y-5">
              {tools.map(tool => (
                <ToolCard
                  key={tool.name}
                  tool={tool}
                  active={isDialogOpen && tool.name === selectedTool?.name}
                  onOpen={openTool}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ToolDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
        tools={tools}
      />
    </>
  )
}
