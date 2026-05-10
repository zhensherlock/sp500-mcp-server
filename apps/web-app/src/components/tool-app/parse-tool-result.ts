const textContentTypes = new Set(['text'])

type TextContentBlock = {
  text: string
  type: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function isTextContentBlock(block: unknown): block is TextContentBlock {
  return (
    isObject(block) &&
    'type' in block &&
    textContentTypes.has(String(block.type)) &&
    'text' in block &&
    typeof block.text === 'string'
  )
}

function getTextContentBlocks(result: Record<string, unknown>) {
  const content = result.content

  if (!Array.isArray(content)) {
    return []
  }

  return content.filter(isTextContentBlock)
}

function getTextContentMessage(result: Record<string, unknown>) {
  const message = getTextContentBlocks(result)
    .map(block => block.text.trim())
    .filter(Boolean)
    .join('\n')

  return message || null
}

function parseTextContent<T>(text: string): T {
  try {
    return JSON.parse(text) as T
  } catch (error) {
    const trimmedText = text.trim()

    if (trimmedText && !trimmedText.startsWith('{') && !trimmedText.startsWith('[')) {
      throw new Error(trimmedText, { cause: error })
    }

    throw error
  }
}

export function parseToolResult<T>(result: unknown): T {
  if (!isObject(result)) {
    throw new Error('Tool result is empty.')
  }

  if (result.isError === true) {
    throw new Error(getTextContentMessage(result) ?? 'Tool returned an error.')
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

  return parseTextContent<T>(textBlock.text)
}
