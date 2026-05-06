import type { DebugTool, ToolParam } from './types'

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

export function buildToolArguments(tool: DebugTool, values: Record<string, string>) {
  return tool.params.reduce<Record<string, string | number>>((argumentsValue, param) => {
    const rawValue = values[param.id]?.trim() ?? ''

    if (!rawValue && !param.required) {
      return argumentsValue
    }

    if (param.type === 'number') {
      argumentsValue[param.id] = Number(rawValue)
      return argumentsValue
    }

    argumentsValue[param.id] = rawValue
    return argumentsValue
  }, {})
}

function getDefaultValueForParam(param: ToolParam) {
  if (param.defaultValue !== undefined) return param.defaultValue
  return ''
}

function createDefaultParams(tool: DebugTool) {
  return tool.params.reduce<Record<string, string>>((values, param) => {
    values[param.id] = getDefaultValueForParam(param)
    return values
  }, {})
}

export function createDefaultInputValuesById(tools: DebugTool[]) {
  return tools.reduce<Record<string, Record<string, string>>>((values, tool) => {
    values[tool.id] = createDefaultParams(tool)
    return values
  }, {})
}
