const textContentTypes = new Set(['text'])

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function isTextContentBlock(block: unknown): block is { text: string; type: string } {
  return (
    isObject(block) &&
    'type' in block &&
    textContentTypes.has(String(block.type)) &&
    'text' in block &&
    typeof block.text === 'string'
  )
}

export function parseToolResult<T>(result: unknown): T {
  if (!isObject(result)) {
    throw new Error('Tool result is empty.')
  }

  const structuredContent = result.structuredContent
  if (structuredContent && typeof structuredContent === 'object') {
    return structuredContent as T
  }

  const content = result.content
  if (!Array.isArray(content)) {
    throw new Error('Tool result has no content blocks.')
  }

  const textBlock = content.find(isTextContentBlock)

  if (!textBlock) {
    throw new Error('Tool result has no text content.')
  }

  return JSON.parse(textBlock.text) as T
}
