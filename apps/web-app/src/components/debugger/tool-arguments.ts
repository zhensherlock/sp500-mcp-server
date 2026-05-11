import type { DebugTool, ToolParam } from './types'

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function parseArrayValue(rawValue: string) {
  const trimmedValue = rawValue.trim()

  if (!trimmedValue) {
    return []
  }

  if (trimmedValue.startsWith('[')) {
    let parsed: unknown

    try {
      parsed = JSON.parse(trimmedValue) as unknown
    } catch {
      return [trimmedValue]
    }

    if (Array.isArray(parsed)) {
      return parsed.map(item => String(item))
    }
  }

  return trimmedValue
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

export function buildToolArguments(tool: DebugTool, values: Record<string, string>) {
  return tool.params.reduce<Record<string, boolean | number | string | string[]>>((argumentsValue, param) => {
    const rawValue = values[param.id]?.trim() ?? ''

    if (!rawValue && !param.required) {
      return argumentsValue
    }

    if (param.type === 'array') {
      argumentsValue[param.id] = parseArrayValue(rawValue)
      return argumentsValue
    }

    if (param.type === 'boolean') {
      argumentsValue[param.id] = rawValue === 'true'
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
