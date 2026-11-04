import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getVercelOidcToken } from '@vercel/oidc'
import { deploymentProtectionHeaders } from '../../lib/deployment-protection'
import { callMcpTool } from '../../lib/mcp-apps/protocol'

vi.mock('@vercel/oidc', () => ({ getVercelOidcToken: vi.fn() }))

beforeEach(() => {
  vi.stubEnv('VERCEL', '1')
  vi.stubEnv('VERCEL_URL', 'preview.example.vercel.app')
  vi.stubEnv('VERCEL_BRANCH_URL', 'branch.example.vercel.app')
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'production.example.vercel.app')
  vi.stubEnv('VERCEL_OIDC_TOKEN', '')
  vi.stubEnv('VERCEL_AUTOMATION_BYPASS_SECRET', '')
  vi.mocked(getVercelOidcToken).mockResolvedValue('request-token')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetAllMocks()
})

describe('Vercel internal request authentication', () => {
  it('resolves a fresh OIDC token on each call to a known project deployment', async () => {
    vi.mocked(getVercelOidcToken).mockResolvedValueOnce('first-token').mockResolvedValueOnce('second-token')
    expect(await deploymentProtectionHeaders('https://preview.example.vercel.app/mcp')).toEqual({
      'x-vercel-trusted-oidc-idp-token': 'first-token',
    })
    expect(await deploymentProtectionHeaders('https://branch.example.vercel.app/eve/v1/session')).toEqual({
      'x-vercel-trusted-oidc-idp-token': 'second-token',
    })
  })

  it.each([
    'https://external.example/mcp',
    'https://preview.example.vercel.app.attacker.example/mcp',
    'http://preview.example.vercel.app/mcp',
    'https://preview.example.vercel.app:8443/mcp',
  ])('does not send either project credential to %s', async target => {
    vi.stubEnv('VERCEL_AUTOMATION_BYPASS_SECRET', 'legacy-secret')
    expect(await deploymentProtectionHeaders(target)).toEqual({})
    expect(getVercelOidcToken).not.toHaveBeenCalled()
  })

  it('preserves explicit bypass configuration for known project deployments', async () => {
    vi.stubEnv('VERCEL_AUTOMATION_BYPASS_SECRET', 'legacy-secret')
    expect(await deploymentProtectionHeaders('https://production.example.vercel.app/mcp')).toEqual({
      'x-vercel-protection-bypass': 'legacy-secret',
    })
    expect(getVercelOidcToken).not.toHaveBeenCalled()
  })

  it('leaves local MCP calls unauthenticated', async () => {
    vi.stubEnv('VERCEL', '')
    expect(await deploymentProtectionHeaders('http://localhost:3000/mcp')).toEqual({})
    expect(getVercelOidcToken).not.toHaveBeenCalled()
  })

  it('attaches the OIDC header to the MCP workflow request without allowing redirects', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ jsonrpc: '2.0', id: 1, result: { content: [] } }))
    vi.stubGlobal('fetch', fetch)
    await callMcpTool(
      'get_company_info',
      { query: 'NVDA' },
      undefined,
      undefined,
      'https://preview.example.vercel.app/mcp',
    )
    expect(fetch.mock.calls[0][1]).toMatchObject({
      headers: { 'x-vercel-trusted-oidc-idp-token': 'request-token' },
      redirect: 'error',
    })
  })
})
