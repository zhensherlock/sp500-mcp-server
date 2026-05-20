'use client'

import Image from 'next/image'
import { type SubmitEvent, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Check, CircleCheck, Copy, Loader2, Play, RefreshCw, X } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import type { Tool, ToolParam } from '@/app/tools/data'
import { getToolIconPath } from '@/components/ToolCard'
import { cn } from '@workspace/ui/lib/utils'

interface ToolDetailsDialogProps {
  onOpenChange: (open: boolean) => void
  onSelectTool: (tool: Tool) => void
  open: boolean
  selectedTool: Tool | null
  tools: Tool[]
}

function formatResultContent(content: unknown) {
  if (typeof content !== 'string') {
    return JSON.stringify(content, null, 2)
  }

  try {
    return JSON.stringify(JSON.parse(content), null, 2)
  } catch {
    return content
  }
}

function coerceValue(param: ToolParam, value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  if (param.type === 'number') {
    const number = Number(trimmed)
    return Number.isFinite(number) ? number : undefined
  }

  if (param.type === 'boolean') {
    return trimmed.toLowerCase() === 'true'
  }

  if (param.type === 'string[]') {
    return trimmed
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }

  return trimmed
}

function hasSampleValue(tool: Tool, paramName: string) {
  return Object.prototype.hasOwnProperty.call(tool.sampleParams, paramName)
}

function getInitialParamValues(tool: Tool) {
  const values = { ...tool.sampleParams }

  tool.params.forEach(param => {
    if (param.type === 'boolean' && !hasSampleValue(tool, param.name)) {
      values[param.name] = 'false'
    }
  })

  return values
}

export function ToolDetailsDialog({ onOpenChange, onSelectTool, open, selectedTool, tools }: ToolDetailsDialogProps) {
  const [paramState, setParamState] = useState<{ toolName: string | null; values: Record<string, string> }>({
    toolName: null,
    values: {},
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (selectedTool) {
      setParamState({ toolName: selectedTool.name, values: getInitialParamValues(selectedTool) })
      setResult(null)
      setError(null)
      setCopied(false)
    }
  }, [selectedTool])

  const displayResult = useMemo(() => {
    if (!selectedTool) {
      return ''
    }

    return result ?? formatResultContent(selectedTool.returns)
  }, [result, selectedTool])

  if (!selectedTool) {
    return null
  }

  const paramValues =
    paramState.toolName === selectedTool.name ? paramState.values : getInitialParamValues(selectedTool)
  const hasRequiredParams = selectedTool.params.every(param => {
    return !param.required || paramValues[param.name]?.trim()
  })
  const selectedToolIconPath = getToolIconPath(selectedTool.name)
  const testParams = selectedTool.params.filter(param => param.required || hasSampleValue(selectedTool, param.name))
  const stackedTestParams = testParams.filter(param => param.type !== 'number' && param.type !== 'boolean')
  const compactTestParams = testParams.filter(param => param.type === 'number' || param.type === 'boolean')
  const actionLabel = isLoading
    ? 'Calling tool...'
    : error
      ? 'Retry call'
      : result
        ? 'Run again'
        : hasRequiredParams
          ? 'Run test call'
          : 'Fill required inputs'
  const statusLabel = isLoading
    ? 'Calling selected tool'
    : error
      ? 'Call failed'
      : result
        ? 'Response ready'
        : hasRequiredParams
          ? 'Ready to run'
          : 'Required input missing'
  const ActionIcon = isLoading ? Loader2 : error || result ? RefreshCw : hasRequiredParams ? Play : AlertCircle
  const responseTitle = isLoading
    ? 'Calling tool'
    : error
      ? 'Error response'
      : result
        ? 'Live response'
        : 'Response example'
  const responseFooterLabel = isLoading
    ? 'Waiting for MCP tool response'
    : error
      ? 'Check inputs or retry the call'
      : 'Live response received'
  const ResponseFooterIcon = isLoading ? Loader2 : error ? AlertCircle : CircleCheck

  const handleCopy = async () => {
    await navigator.clipboard.writeText(error ?? displayResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleParamChange = (name: string, value: string) => {
    setParamState(prev => {
      const values = prev.toolName === selectedTool.name ? prev.values : getInitialParamValues(selectedTool)

      return {
        toolName: selectedTool.name,
        values: { ...values, [name]: value },
      }
    })
  }

  const handleExecute = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const callParams: Record<string, unknown> = {}

      selectedTool.params.forEach(param => {
        const coercedValue = coerceValue(param, paramValues[param.name] ?? '')

        if (coercedValue !== undefined) {
          callParams[param.name] = coercedValue
        }
      })

      const response = await fetch('/api/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName: selectedTool.name, params: callParams }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to call tool')
      }

      const content = data.content?.[0]?.text ?? data
      setResult(formatResultContent(content))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!hasRequiredParams || isLoading) {
      return
    }

    void handleExecute()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-[#071A33]/45 supports-backdrop-filter:backdrop-blur-[1px]"
        className="max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-280 overflow-hidden rounded-[30px] border-[#DCE8F5] bg-white p-0 shadow-[0_28px_58px_rgba(7,26,51,0.25)] ring-0 sm:max-w-280 lg:h-208 lg:w-280"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{selectedTool.name}</DialogTitle>
          <DialogDescription>Tool inputs, example output, and Test Call controls.</DialogDescription>
        </DialogHeader>
        <div className="relative grid max-h-[calc(100vh-2rem)] grid-cols-1 gap-6 overflow-y-auto p-5 sm:p-7 lg:h-full lg:grid-cols-[250px_356px_390px] lg:grid-rows-[66px_654px] lg:gap-x-8 lg:gap-y-7.5 lg:p-7.5">
          <div className="flex min-w-0 items-start gap-4 pr-12 lg:col-span-3 lg:col-start-1 lg:row-start-1 lg:pr-20">
            <span className="relative flex size-16.5 shrink-0 items-center justify-center overflow-hidden rounded-[21px] border border-[#DCE8F5] bg-[#EEF5FC] shadow-[0_12px_22px_rgba(18,54,92,0.09)]">
              <Image src={selectedToolIconPath} alt="" width={66} height={66} className="object-cover" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 className="break-all font-mono text-[22px] font-extrabold leading-[1.3] text-[#071A33]">
                {selectedTool.name}
              </h2>
              <p className="mt-0.5 max-w-220 text-[14px] font-normal leading-[1.4] text-[#53657A]">
                {selectedTool.description}
              </p>
            </div>
          </div>

          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-5 top-5 size-9.5 rounded-full border border-[#DCE8F5] bg-[#F5F9FF] text-[#7A8BA0] hover:border-[#BFDBFE] hover:bg-[#E8F1FF] hover:text-[#071A33] sm:right-7 sm:top-7 lg:right-7.5 lg:top-7.5"
              aria-label="Close tool details"
            >
              <X className="size-4.5" aria-hidden="true" />
            </Button>
          </DialogClose>

          <aside className="flex flex-col border-b border-[#DCE8F5] pb-6 lg:col-start-1 lg:row-start-2 lg:border-b-0 lg:pb-0">
            <p className="text-[12px] font-extrabold leading-3.75 text-[#7A8BA0]">Tools</p>
            <div className="mt-3.25 flex flex-col gap-2">
              {tools.map(tool => {
                const isActive = tool.name === selectedTool.name
                return (
                  <button
                    key={tool.name}
                    type="button"
                    className={cn(
                      'flex h-12.5 w-full items-center gap-2.5 rounded-[14px] border border-[#EAF1F8] bg-white px-2.25 text-left font-mono text-[12px] font-extrabold leading-4 text-[#071A33] transition-colors hover:border-[#BFDBFE] hover:bg-[#F8FBFF] focus-visible:border-[#2563EB] focus-visible:ring-3 focus-visible:ring-[#2563EB]/20 focus-visible:outline-none',
                      isActive && 'border-[#BFDBFE] bg-[#E8F1FF]',
                    )}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => onSelectTool(tool)}
                  >
                    <span
                      className={cn(
                        'relative flex size-7 shrink-0 overflow-hidden rounded-[9px] border border-[#DCE8F5] bg-[#EEF5FC]',
                        isActive && 'border-[#BFDBFE]',
                      )}
                    >
                      <Image src={getToolIconPath(tool.name)} alt="" width={28} height={28} className="object-cover" />
                    </span>
                    <span className="min-w-0 truncate">{tool.name}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-7.5 max-w-61 text-[13px] font-normal leading-[1.45] text-[#7A8BA0]">
              Clicking any tool opens the same detail modal with its own params, sample output, and Test Call controls.
            </p>
          </aside>

          <div className="flex flex-col gap-6 lg:col-start-2 lg:row-start-2">
            <section className="rounded-[22px] border border-[#DCE8F5] bg-[#F8FBFF] p-4.5 lg:h-77">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-heading text-[20px] font-extrabold leading-[1.3] text-[#071A33]">
                  Input parameters
                </h3>
                <p className="text-[13px] font-normal leading-4 text-[#7A8BA0]">
                  Schema shown from the tool definition
                </p>
              </div>
              <div className="mt-3.25 flex flex-col gap-1.5">
                {selectedTool.params.map(param => (
                  <div
                    key={param.name}
                    className="grid h-8 grid-cols-[100px_1fr_auto] items-center rounded-[10px] border border-[#EAF1F8] bg-white px-3"
                  >
                    <span className="truncate font-mono text-[12px] font-extrabold leading-4 text-[#071A33]">
                      {param.name}
                    </span>
                    <span className="truncate text-[12px] font-bold leading-4 text-[#53657A]">{param.type}</span>
                    <span
                      className={cn(
                        'text-[12px] font-extrabold leading-4',
                        param.required ? 'text-[#2563EB]' : 'text-[#7A8BA0]',
                      )}
                    >
                      {param.required ? 'required' : 'optional'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[22px] border border-[#DCE8F5] bg-white p-4.5 lg:h-80.5">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-heading text-[20px] font-extrabold leading-[1.3] text-[#071A33]">Test Call</h3>
                <p className="text-[13px] font-normal leading-4 text-[#7A8BA0]">
                  Try the selected tool with sample inputs.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="mt-3.5 flex flex-col gap-2.5">
                {stackedTestParams.map(param => (
                  <div key={param.name} className="relative">
                    <label
                      htmlFor={`tool-param-${selectedTool.name}-${param.name}`}
                      className="pointer-events-none absolute left-3.5 top-2.25 z-10 text-[11px] font-extrabold leading-3.5 text-[#7A8BA0]"
                    >
                      {param.name}
                    </label>
                    <Input
                      id={`tool-param-${selectedTool.name}-${param.name}`}
                      aria-invalid={param.required && !paramValues[param.name]?.trim()}
                      className="h-13.5 rounded-[14px] border-[#EAF1F8] bg-[#F8FBFF] px-3.5 pb-2 pt-6.25 text-[14px] font-bold leading-5 text-[#071A33] placeholder:text-[#7A8BA0]/70 focus-visible:border-[#2563EB]"
                      type="text"
                      value={paramValues[param.name] ?? ''}
                      placeholder={param.description}
                      onChange={event => handleParamChange(param.name, event.target.value)}
                    />
                  </div>
                ))}
                {compactTestParams.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {compactTestParams.map(param => (
                      <div key={param.name} className="relative">
                        <label
                          htmlFor={`tool-param-${selectedTool.name}-${param.name}`}
                          className="pointer-events-none absolute left-3.5 top-2 z-10 text-[11px] font-extrabold leading-3.5 text-[#7A8BA0]"
                        >
                          {param.name}
                        </label>
                        {param.type === 'boolean' ? (
                          <Select
                            value={paramValues[param.name] ?? 'false'}
                            onValueChange={value => handleParamChange(param.name, value)}
                          >
                            <SelectTrigger
                              id={`tool-param-${selectedTool.name}-${param.name}`}
                              aria-invalid={param.required && !paramValues[param.name]?.trim()}
                              className="relative h-12! w-full items-end justify-start rounded-[14px] border-[#EAF1F8] bg-[#F8FBFF] px-3.5 pb-2 pl-3.5 pr-9 pt-5.75 text-left text-[14px] font-extrabold leading-5 text-[#071A33] focus-visible:border-[#2563EB] data-placeholder:text-[#7A8BA0]/70 [&>svg]:absolute [&>svg]:right-3.5 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 **:data-[slot=select-value]:block **:data-[slot=select-value]:max-w-full **:data-[slot=select-value]:truncate **:data-[slot=select-value]:leading-5"
                            >
                              <SelectValue placeholder={param.description} />
                            </SelectTrigger>
                            <SelectContent
                              position="popper"
                              align="start"
                              className="z-60 min-w-(--radix-select-trigger-width) rounded-[14px] border border-[#DCE8F5] bg-white p-1 text-[#071A33] shadow-[0_14px_30px_rgba(7,26,51,0.16)] ring-0 **:data-[position=popper]:h-auto!"
                            >
                              <SelectGroup>
                                <SelectItem
                                  value="true"
                                  className="h-8 rounded-[10px] px-2 pr-7 text-[13px] font-bold text-[#071A33] focus:bg-[#E8F1FF] focus:text-[#071A33]"
                                >
                                  true
                                </SelectItem>
                                <SelectItem
                                  value="false"
                                  className="h-8 rounded-[10px] px-2 pr-7 text-[13px] font-bold text-[#071A33] focus:bg-[#E8F1FF] focus:text-[#071A33]"
                                >
                                  false
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={`tool-param-${selectedTool.name}-${param.name}`}
                            aria-invalid={param.required && !paramValues[param.name]?.trim()}
                            className="h-12 rounded-[14px] border-[#EAF1F8] bg-[#F8FBFF] px-3.5 pb-2 pt-5.75 text-[14px] font-extrabold leading-5 text-[#071A33] placeholder:text-[#7A8BA0]/70 focus-visible:border-[#2563EB]"
                            type="number"
                            value={paramValues[param.name] ?? ''}
                            placeholder={param.description}
                            onChange={event => handleParamChange(param.name, event.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-1.25">
                  <Button
                    type="submit"
                    aria-busy={isLoading}
                    className={cn(
                      'h-10 w-full gap-2 rounded-[14px] bg-[#2563EB] px-4 text-[13px] font-extrabold shadow-[0_8px_18px_rgba(37,99,235,0.15)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-[0_12px_22px_rgba(37,99,235,0.18)] active:translate-y-px disabled:translate-y-0 disabled:border-[#DCE8F5] disabled:bg-[#EAF1F8] disabled:text-[#7A8BA0] disabled:shadow-none',
                    )}
                    disabled={isLoading || !hasRequiredParams}
                  >
                    <ActionIcon className={cn('size-3.5', isLoading && 'animate-spin')} aria-hidden="true" />
                    {actionLabel}
                  </Button>
                  <span className="sr-only" aria-live="polite">
                    {statusLabel}
                  </span>
                </div>
              </form>
            </section>
          </div>

          <section className="relative min-h-163.5 min-w-0 overflow-hidden rounded-[22px] border border-[#173657] bg-[#081A2F] lg:col-start-3 lg:row-start-2 lg:h-[654px]">
            <div className="flex h-14.5 items-center justify-between bg-[#0C2038] px-4.5">
              <h3 className="font-heading text-[18px] font-extrabold leading-5.75 text-white">{responseTitle}</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 text-[#B8D7F5] hover:bg-[#173657] hover:text-white"
                disabled={isLoading}
                onClick={handleCopy}
                aria-label={copied ? 'Copied response' : 'Copy response'}
              >
                {copied ? <Check className="size-4.5" /> : <Copy className="size-4.5" />}
              </Button>
            </div>
            <ScrollArea className="h-133 min-w-0">
              {isLoading ? (
                <div className="flex h-133 flex-col items-center justify-center px-8 text-center text-[#D9EAFF]">
                  <Loader2 className="size-6 animate-spin text-[#93C5FD]" aria-hidden="true" />
                  <p className="mt-4 font-heading text-[18px] font-extrabold leading-6 text-white">Calling MCP tool</p>
                  <p className="mt-2 max-w-65 text-[13px] font-semibold leading-5 text-[#B8D7F5]">
                    Running {selectedTool.name} with the current inputs.
                  </p>
                </div>
              ) : (
                <pre
                  className={cn(
                    'min-w-0 max-w-full overflow-x-hidden px-4.5 pb-2 pt-5 font-mono text-[12px] font-normal leading-[1.42] whitespace-pre-wrap [overflow-wrap:anywhere]',
                    error ? 'text-red-200' : 'text-[#D9EAFF]',
                  )}
                >
                  {error ?? displayResult}
                </pre>
              )}
            </ScrollArea>
            <div
              className={cn(
                'absolute right-4.5 bottom-4.5 left-4.5 flex min-h-10.5 items-center gap-2 rounded-[14px] border border-[#244563] bg-[#0E2947] px-3 text-[11px] font-extrabold leading-4 text-[#D9EAFF]',
                error && 'border-red-400/25 bg-red-950/35 text-red-100',
              )}
            >
              <ResponseFooterIcon
                className={cn(
                  'size-4 shrink-0',
                  isLoading && 'animate-spin text-[#93C5FD]',
                  error ? 'text-red-300' : !isLoading && 'text-[#16A34A]',
                )}
                aria-hidden="true"
              />
              <span className="min-w-0 whitespace-nowrap">{responseFooterLabel}</span>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
