import type { Tool } from '@modelcontextprotocol/sdk/types.js'

import type { DebugTool, JsonSchemaProperty, ToolParam } from './types'

function schemaTypeIncludes(property: JsonSchemaProperty, type: string) {
  if (Array.isArray(property.type)) return property.type.includes(type)
  return property.type === type
}

function createParamFromSchema(id: string, property: object, requiredIds: Set<string>): ToolParam {
  const schemaProperty = property as JsonSchemaProperty
  const isNumber = schemaTypeIncludes(schemaProperty, 'number') || schemaTypeIncludes(schemaProperty, 'integer')
  const enumOptions = schemaProperty.enum?.filter(option => typeof option === 'string')
  const defaultValue = schemaProperty.default === undefined ? undefined : String(schemaProperty.default)

  return {
    defaultValue,
    id,
    label: schemaProperty.title || id,
    max: schemaProperty.maximum ?? schemaProperty.maxLength,
    min: schemaProperty.minimum ?? schemaProperty.minLength,
    options: enumOptions,
    placeholder: schemaProperty.description || (id === 'query' ? 'AAPL or Apple' : undefined),
    required: requiredIds.has(id),
    type: enumOptions?.length ? 'select' : isNumber ? 'number' : 'text',
  }
}

function getToolEntryPath(tool: Tool) {
  const uiMeta = tool._meta?.ui
  const resourceUri = uiMeta && typeof uiMeta === 'object' && 'resourceUri' in uiMeta ? uiMeta.resourceUri : undefined

  if (typeof resourceUri !== 'string') return ''

  const fileName = resourceUri.split('/').pop()

  return fileName ? `/${fileName}` : ''
}

export function createDebugTool(tool: Tool): DebugTool {
  const properties = tool.inputSchema.properties ?? {}
  const requiredIds = new Set(tool.inputSchema.required ?? [])

  return {
    description: tool.description,
    entryPath: getToolEntryPath(tool),
    id: tool.name,
    label: tool.title || tool.annotations?.title || tool.name,
    mcpToolName: tool.name,
    params: Object.entries(properties).map(([id, property]) => createParamFromSchema(id, property, requiredIds)),
  }
}
