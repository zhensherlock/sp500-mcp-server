'use client'

import { useState } from 'react'
import { ChevronDown, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolTestDialog } from '@/components/ToolTestDialog'

interface Param {
  name: string
  type: string
  required: boolean
  description: string
}

interface ToolCardProps {
  name: string
  description: string
  params: Param[]
  returns: string
}

export default function ToolCard({ name, description, params, returns }: ToolCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className={`border border-border rounded-xl mb-6 overflow-hidden bg-card ${isOpen ? 'open' : ''}`}>
      <button
        className="w-full p-6 cursor-pointer flex items-start justify-between gap-4 transition-colors bg-transparent border-none text-left font-inherit text-foreground hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`tool-content-${name}`}
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-semibold text-foreground">{name}</span>
            <span className="text-xs font-medium px-1.5 py-0.5 bg-primary text-primary-foreground rounded-sm">
              Tool
            </span>
          </div>
          <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <ChevronDown
          size={20}
          strokeWidth={1.5}
          className="shrink-0 text-muted-foreground transition-transform duration-200"
          aria-hidden="true"
        />
      </button>
      <div
        className="grid transition-grid-rows duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 border-t border-border">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-4">
              Test Call
            </h4>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-2">
              <Play size={16} />
              Test Call
            </Button>

            <ToolTestDialog toolName={name} params={params} open={isDialogOpen} onOpenChange={setIsDialogOpen} />

            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-4">
              Parameters
            </h4>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left font-semibold text-foreground p-3 bg-accent border-b border-border rounded-t-md">
                    Name
                  </th>
                  <th className="text-left font-semibold text-foreground p-3 bg-accent border-b border-border">Type</th>
                  <th className="text-left font-semibold text-foreground p-3 bg-accent border-b border-border rounded-t-md">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {params.map(param => (
                  <tr key={param.name}>
                    <td className="p-3 border-b border-border align-top">
                      <span className="font-mono font-medium text-foreground">{param.name}</span>
                      {param.required ? (
                        <span className="inline-block text-xs font-semibold px-1 py-0.5 bg-destructive text-white rounded-sm ml-2">
                          required
                        </span>
                      ) : (
                        <span className="inline-block text-xs font-medium px-1 py-0.5 bg-muted text-muted-foreground rounded-sm ml-2">
                          optional
                        </span>
                      )}
                    </td>
                    <td className="p-3 border-b border-border align-top">
                      <span className="font-mono text-sm text-muted-foreground">{param.type}</span>
                    </td>
                    <td className="p-3 border-b border-border align-top">
                      <span className="text-muted-foreground leading-relaxed">{param.description}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-4">Returns</h4>
            <div className="bg-accent border border-border rounded-lg p-4 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-foreground m-0 whitespace-pre">{returns}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
