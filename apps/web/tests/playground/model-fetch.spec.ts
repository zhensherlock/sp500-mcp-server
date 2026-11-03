import { createServer } from 'node:http'
import { getGlobalDispatcher } from 'undici'
import { describe, expect, it } from 'vitest'
import { createModelFetch } from '../../lib/playground/model-fetch'

describe('model-only proxy', () => {
  it('leaves the provider default untouched when no proxy is configured', () => {
    expect(createModelFetch()).toBeUndefined()
    expect(createModelFetch('  ')).toBeUndefined()
  })

  it('routes model fetches through the proxy without changing the global dispatcher', async () => {
    let requestedTarget: string | undefined
    let requestLine: string | undefined
    const proxy = createServer()
    proxy.on('connect', (request, socket) => {
      requestedTarget = request.url
      socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      socket.once('data', chunk => {
        requestLine = chunk.toString().split('\r\n')[0]
        const body = 'proxied response'
        socket.end(`HTTP/1.1 200 OK\r\nContent-Length: ${Buffer.byteLength(body)}\r\nConnection: close\r\n\r\n${body}`)
      })
    })
    await new Promise<void>(resolve => proxy.listen(0, '127.0.0.1', resolve))
    const address = proxy.address()
    if (!address || typeof address === 'string') throw new Error('Missing test proxy address.')
    const originalDispatcher = getGlobalDispatcher()
    try {
      const modelFetch = createModelFetch(`http://127.0.0.1:${address.port}`)!
      const response = await modelFetch('http://model-provider.invalid/v1/responses', {
        signal: AbortSignal.timeout(5000),
      })
      expect(await response.text()).toBe('proxied response')
      expect(requestedTarget).toBe('model-provider.invalid:80')
      expect(requestLine).toBe('GET /v1/responses HTTP/1.1')
      expect(getGlobalDispatcher()).toBe(originalDispatcher)
    } finally {
      proxy.closeAllConnections()
      await new Promise<void>((resolve, reject) => proxy.close(error => (error ? reject(error) : resolve())))
    }
  })
})
