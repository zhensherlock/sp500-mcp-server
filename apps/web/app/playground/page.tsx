import type { Metadata } from 'next'
import Header from '@/components/Header'
import { Playground } from '@/components/playground/Playground'

export const metadata: Metadata = {
  title: 'Agent Playground | S&P 500 MCP',
  description: 'Explore S&P 500 companies with an agent, real MCP tools, and interactive app results.',
}

export default function PlaygroundPage() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <Header />
      </div>
      <Playground />
    </div>
  )
}
