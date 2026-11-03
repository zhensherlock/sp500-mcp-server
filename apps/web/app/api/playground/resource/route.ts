import { readMCPAppResource } from '@ai-sdk/mcp'
import { appResourceUri, companyTools } from '@/lib/mcp-apps/contracts'
import { createAppsClient } from '@/lib/mcp-apps/protocol'
import { requirePlaygroundRequest } from '@/lib/playground/auth'

export async function GET(request: Request) {
  try {
    requirePlaygroundRequest(request)
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const uri = new URL(request.url).searchParams.get('uri')
  if (!uri || !Object.keys(companyTools).some(name => appResourceUri(name as keyof typeof companyTools) === uri)) {
    return Response.json({ error: 'Unknown app resource.' }, { status: 400 })
  }
  let client: Awaited<ReturnType<typeof createAppsClient>> | undefined
  try {
    client = await createAppsClient()
    const resource = await readMCPAppResource({ client, uri })
    return Response.json(resource, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return Response.json(
      { error: 'Could not load the MCP App. Build apps/web-app and check the MCP endpoint.' },
      { status: 502 },
    )
  } finally {
    await client?.close()
  }
}
