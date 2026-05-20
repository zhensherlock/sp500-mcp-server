'use client'

import { useRef } from 'react'
import { AppWindow, Brain, Database, MessageCircleQuestion } from 'lucide-react'
import { useScrollStagger } from '@/hooks/useEntranceAnimation'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

const features = [
  {
    icon: Database,
    title: 'Company Data',
    description: 'Real-time and historical data for all S&P 500 companies. Financials, profiles, metrics, and more.',
    iconClassName: 'bg-blue-soft text-primary',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Elicitation',
    description: 'Prompt users for required information before executing complex operations.',
    iconClassName: 'bg-success-soft text-success',
  },
  {
    icon: Brain,
    title: 'Sampling',
    description: 'Summarize and analyze data with AI-powered sampling capabilities.',
    iconClassName: 'bg-violet-soft text-violet',
  },
  {
    icon: AppWindow,
    title: 'MCP Apps',
    description: 'Build interactive UIs that render directly inside MCP hosts for rich, context-aware experiences.',
    iconClassName: 'bg-warning-soft text-warning',
  },
]

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useScrollStagger(sectionRef, '[data-feature-entrance]', {
    stagger: 0.08,
    y: 22,
  })

  return (
    <section ref={sectionRef} className="bg-card px-6 py-16 xl:px-0">
      <div className="mx-auto flex max-w-312 flex-col items-center gap-12">
        <div className="animate-on-scroll flex max-w-180 flex-col items-center gap-4 text-center" data-feature-entrance>
          <h2 className="font-heading text-[clamp(2rem,4vw,2.75rem)] font-extrabold leading-[1.15] text-foreground">
            Everything your AI needs
          </h2>
          <p className="text-[17px] leading-[1.45] text-muted-foreground">
            Precise S&amp;P 500 tools packaged for modern AI clients, agents, and developer workflows.
          </p>
        </div>
        <div className="grid w-full gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(feature => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="animate-on-scroll rounded-[22px] border-border py-0 shadow-(--shadow-card)"
                data-feature-entrance
              >
                <CardHeader className="px-6 pt-6">
                  <span
                    className={`flex size-12.5 items-center justify-center rounded-[15px] ${feature.iconClassName}`}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 px-6 pb-6">
                  <CardTitle className="font-heading text-xl font-extrabold text-foreground">{feature.title}</CardTitle>
                  <p className="text-[15px] leading-[1.45] text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
