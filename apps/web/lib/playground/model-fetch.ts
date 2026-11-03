import { ProxyAgent } from 'undici'

// Scope the dispatcher to the model provider. A global dispatcher would also
// send the agent's localhost MCP calls and workflow traffic through the proxy.
export function createModelFetch(proxyUrl?: string, fetchImplementation = globalThis.fetch): typeof fetch | undefined {
  if (!proxyUrl?.trim()) return undefined
  const dispatcher = new ProxyAgent(proxyUrl.trim())
  return (input, init) => {
    const options = { ...init, dispatcher }
    return fetchImplementation(input, options)
  }
}
