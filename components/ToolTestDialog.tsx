'use client'

import { useState } from 'react'
import { Loader2, Play, Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Param {
  name: string
  type: string
  required: boolean
  description: string
}

interface ToolTestDialogProps {
  toolName: string
  params: Param[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ToolTestDialog({ toolName, params, open, onOpenChange }: ToolTestDialogProps) {
  const [paramValues, setParamValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(params.map(p => [p.name, ''])),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleParamChange = (name: string, value: string) => {
    setParamValues(prev => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    setParamValues(Object.fromEntries(params.map(p => [p.name, ''])))
    setResult(null)
    setError(null)
  }

  const handleExecute = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const callParams: Record<string, string | number> = {}
      params.forEach(p => {
        const value = paramValues[p.name]
        if (value) {
          callParams[p.name] = p.type === 'number' ? Number(value) : value
        }
      })

      const response = await fetch('/api/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, params: callParams }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to call tool')
      }

      const content = data.content?.[0]?.text || JSON.stringify(data, null, 2)
      setResult(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      handleReset()
    }
    onOpenChange(open)
  }

  const hasRequiredParams = params.every(p => !p.required || paramValues[p.name].trim() !== '')

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl overflow-y-auto" style={{ width: '90vw', maxWidth: 896, maxHeight: '90vh' }}>
        <DialogHeader>
          <DialogTitle>Test {toolName}</DialogTitle>
          <DialogDescription>Enter parameters to execute this tool</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {params.map(param => (
            <div key={param.name} className="flex flex-col gap-1.5">
              <label htmlFor={`dialog-param-${toolName}-${param.name}`} className="text-sm font-medium text-foreground">
                {param.name}
                {param.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <input
                id={`dialog-param-${toolName}-${param.name}`}
                type={param.type === 'number' ? 'number' : 'text'}
                value={paramValues[param.name]}
                onChange={e => handleParamChange(param.name, e.target.value)}
                placeholder={param.description}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          ))}
        </div>

        <ScrollArea className="h-80 border border-border rounded-lg bg-accent/50">
          <div className="relative p-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <pre className="font-mono text-sm text-destructive whitespace-pre-wrap break-all">{error}</pre>
              </div>
            )}
            {result && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Result</p>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground" onClick={handleCopy}>
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </Button>
                </div>
                <pre className="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap break-all">
                  {result}
                </pre>
              </div>
            )}
            {!error && !result && (
              <p className="text-sm text-muted-foreground italic">Result will appear here after execution</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleExecute} disabled={isLoading || !hasRequiredParams}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Calling...
              </>
            ) : (
              <>
                <Play size={16} />
                Execute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
