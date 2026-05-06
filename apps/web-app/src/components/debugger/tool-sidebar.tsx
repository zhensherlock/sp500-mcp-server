import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@workspace/ui/components/combobox'
import { Input } from '@workspace/ui/components/input'
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

type ToolSidebarProps = {
  executionError: string | null
  isExecuting: boolean
  onExecuteTool: () => void
  onInputValuesChange: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
  onSelectedToolIdChange: (toolId: string) => void
  selectedTool: DebugTool
  toolArguments: Record<string, string | number>
  toolInputValues: Record<string, string>
  tools: DebugTool[]
}

export function ToolSidebar({
  executionError,
  isExecuting,
  onExecuteTool,
  onInputValuesChange,
  onSelectedToolIdChange,
  selectedTool,
  toolArguments,
  toolInputValues,
  tools,
}: ToolSidebarProps) {
  return (
    <aside className="border-b border-neutral-200 bg-white p-5 lg:border-b-0 lg:border-r">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">MCP App Debugger</p>
        <h1 className="mt-1 text-2xl font-semibold">Local preview host</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Switch pages and run MCP tools from the live server metadata.
        </p>
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

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
        <dt className="font-medium text-neutral-500">Tool</dt>
        <dd className="font-mono text-neutral-800">{selectedTool.mcpToolName}</dd>
        <dt className="font-medium text-neutral-500">Entry</dt>
        <dd>
          {selectedTool.entryPath ? (
            <a className="font-mono text-blue-700 hover:underline" href={selectedTool.entryPath}>
              {selectedTool.entryPath}
            </a>
          ) : (
            <span className="font-mono text-neutral-500">No app resource</span>
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
          <span className="rounded-md bg-neutral-100 px-2 py-1 font-mono text-[11px] text-neutral-500">
            {selectedTool.params.length} params
          </span>
        </div>

        {selectedTool.params.map(param => (
          <label className="block" key={param.id}>
            <span className="flex items-center justify-between gap-3 text-sm font-medium">
              <span>{param.label}</span>
              {!param.required ? <span className="text-xs font-normal text-neutral-500">optional</span> : null}
            </span>

            {param.type === 'select' ? (
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
                    {param.options?.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
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
                placeholder={param.placeholder}
                required={param.required}
                type={param.type === 'number' ? 'number' : 'text'}
                value={toolInputValues[param.id] ?? ''}
              />
            )}
          </label>
        ))}

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Arguments</p>
          <pre className="mt-2 max-h-40 overflow-auto font-mono text-xs leading-relaxed text-neutral-700">
            {formatJson(toolArguments)}
          </pre>
        </div>

        {executionError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{executionError}</div>
        ) : null}

        <button
          className="h-10 w-full rounded-md bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
          disabled={isExecuting}
          type="submit"
        >
          {isExecuting ? 'Executing...' : 'Execute tool'}
        </button>
      </form>
    </aside>
  )
}
