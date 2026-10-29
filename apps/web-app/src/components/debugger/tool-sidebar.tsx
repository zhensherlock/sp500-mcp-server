import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@workspace/ui/components/combobox'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

import { formatJson } from './tool-arguments'
import type { DebugTool } from './types'
import React from 'react'
import type { AppTheme } from '@/components/tool-app/app-theme'

type ToolSidebarProps = {
  executionError: string | null
  isExecuting: boolean
  onExecuteTool: () => void
  onInputValuesChange: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
  onSelectedToolIdChange: (toolId: string) => void
  onThemeChange: (theme: AppTheme) => void
  selectedTool: DebugTool
  toolArguments: Record<string, boolean | number | string | string[]>
  toolInputValues: Record<string, string>
  tools: DebugTool[]
  theme: AppTheme
}

export function ToolSidebar({
  executionError,
  isExecuting,
  onExecuteTool,
  onInputValuesChange,
  onSelectedToolIdChange,
  onThemeChange,
  selectedTool,
  toolArguments,
  toolInputValues,
  tools,
  theme,
}: ToolSidebarProps) {
  return (
    <aside className="border-b border-border bg-background p-5 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MCP App Debugger</p>
        <h1 className="mt-1 text-2xl font-semibold">Local preview host</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Switch pages and run MCP tools from the live server metadata.
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Preview theme</span>
          <ToggleGroup
            aria-label="Preview theme"
            onValueChange={value => {
              if (value === 'light' || value === 'dark') onThemeChange(value)
            }}
            size="sm"
            type="single"
            value={theme}
            variant="outline"
          >
            <ToggleGroupItem value="light">Light</ToggleGroupItem>
            <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <Combobox
        items={tools}
        itemToStringLabel={tool => tool.label}
        itemToStringValue={tool => tool.id}
        value={selectedTool}
        onValueChange={value => {
          if (value) onSelectedToolIdChange(value.id)
        }}
      >
        <ComboboxInput placeholder="Select a tool" />
        <ComboboxContent>
          <ComboboxEmpty>No tool found.</ComboboxEmpty>
          <ComboboxList>
            {item => (
              <ComboboxItem key={item.id} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-lg border border-border bg-muted p-3 text-sm">
        <dt className="font-medium text-muted-foreground">Tool</dt>
        <dd className="font-mono text-foreground">{selectedTool.mcpToolName}</dd>
        <dt className="font-medium text-muted-foreground">Entry</dt>
        <dd>
          {selectedTool.entryPath ? (
            <a className="font-mono text-link hover:underline" href={selectedTool.entryPath}>
              {selectedTool.entryPath}
            </a>
          ) : (
            <span className="font-mono text-muted-foreground">No app resource</span>
          )}
        </dd>
      </dl>

      <form
        className="mt-5 space-y-4"
        onSubmit={event => {
          event.preventDefault()
          onExecuteTool()
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Tool input</h2>
          <span className="rounded-md bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
            {selectedTool.params.length} params
          </span>
        </div>

        {selectedTool.params.map(param => (
          <label className="block" key={param.id}>
            <span className="flex items-center justify-between gap-3 text-sm font-medium">
              <span>{param.label}</span>
              {!param.required ? <span className="text-xs font-normal text-muted-foreground">optional</span> : null}
            </span>

            {param.type === 'select' || param.type === 'boolean' ? (
              <Select
                onValueChange={value =>
                  onInputValuesChange(previous => ({
                    ...previous,
                    [selectedTool.id]: {
                      ...previous[selectedTool.id],
                      [param.id]: value === 'any' ? '' : value,
                    },
                  }))
                }
                value={toolInputValues[param.id] || 'any'}
              >
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="any">Any</SelectItem>
                    {param.type === 'boolean' ? (
                      <>
                        <SelectItem value="true">true</SelectItem>
                        <SelectItem value="false">false</SelectItem>
                      </>
                    ) : (
                      param.options?.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <Input
                className="mt-2"
                max={param.max}
                min={param.min}
                onChange={event =>
                  onInputValuesChange(previous => ({
                    ...previous,
                    [selectedTool.id]: {
                      ...previous[selectedTool.id],
                      [param.id]: event.target.value,
                    },
                  }))
                }
                placeholder={param.type === 'array' ? 'Total Revenue, Net Income' : param.placeholder}
                required={param.required}
                type={param.type === 'number' ? 'number' : 'text'}
                value={toolInputValues[param.id] ?? ''}
              />
            )}
          </label>
        ))}

        <div className="rounded-lg border border-border bg-muted p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arguments</p>
          <pre className="mt-2 max-h-40 overflow-auto font-mono text-xs leading-relaxed text-foreground">
            {formatJson(toolArguments)}
          </pre>
        </div>

        {executionError ? (
          <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
            {executionError}
          </div>
        ) : null}

        <Button className="h-10 w-full" disabled={isExecuting} type="submit">
          {isExecuting ? 'Executing...' : 'Execute tool'}
        </Button>
      </form>
    </aside>
  )
}
