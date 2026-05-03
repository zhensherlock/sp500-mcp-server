'use client'

import { Database, MessageCircleQuestion, Brain, AppWindow } from 'lucide-react'
import { useRef } from 'react'
import { useScrollStagger } from '@/hooks/useEntranceAnimation'

const features = [
  {
    icon: <Database size={24} strokeWidth={1.5} />,
    title: 'Company Data',
    description:
      'Access comprehensive S&P 500 company information including financials, leadership, and business summaries.',
  },
  {
    icon: <MessageCircleQuestion size={24} strokeWidth={1.5} />,
    title: 'Elicitation',
    description: 'Prompt users for required information before executing complex operations.',
  },
  {
    icon: <Brain size={24} strokeWidth={1.5} />,
    title: 'Sampling',
    description: 'Summarize and analyze data with AI-powered sampling capabilities.',
  },
  {
    icon: <AppWindow size={24} strokeWidth={1.5} />,
    title: 'MCP Apps',
    description: 'Build interactive UIs that render directly inside MCP hosts for rich, context-aware experiences.',
  },
]

export default function FeaturesSection() {
  const featuresRef = useRef<HTMLDivElement>(null)

  useScrollStagger(featuresRef, '.feature-card', { stagger: 0.15, y: 30 })

  return (
    <section ref={featuresRef} className="py-24 px-6">
      <div className="max-w-300 mx-auto">
        <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] font-bold tracking-tight mb-4 text-foreground">
          Everything your AI needs
        </h2>
        <p className="text-base text-muted-foreground max-w-[65ch] leading-relaxed">
          A complete MCP server for S&P 500 company data and AI-powered applications.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-12">
          {features.map(feature => (
            <div
              key={feature.title}
              className="feature-card animate-on-scroll p-6 bg-card border border-border rounded-xl"
            >
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
  )
}
