import type { Metadata } from 'next'
import Header from '@/components/Header'
import { A2APlayground } from '@/components/playground/A2APlayground'

export const metadata: Metadata = {
  title: 'A2A Playground | S&P 500 MCP',
  description: 'Ask the A2A agent for an S&P 500 company brief with annual financials and recent news.',
}

export default function A2APlaygroundPage() {
  return (
    <div data-workspace="playground" className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <Header variant="workspace" />
      </div>
      <A2APlayground />
    </div>
  )
}
