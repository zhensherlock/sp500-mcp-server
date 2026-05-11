export type ParamType = 'array' | 'boolean' | 'number' | 'select' | 'text'

export type JsonSchemaProperty = {
  default?: string | number | boolean
  description?: string
  enum?: string[]
  items?: JsonSchemaProperty
  maximum?: number
  maxLength?: number
  minimum?: number
  minLength?: number
  title?: string
  type?: string | string[]
}

export type ToolParam = {
  defaultValue?: string
  id: string
  label: string
  type: ParamType
  required?: boolean
  placeholder?: string
  options?: string[]
  min?: number
  max?: number
}

export type DebugTool = {
  id: string
  label: string
  mcpToolName: string
  entryPath: string
  description?: string
  params: ToolParam[]
}
