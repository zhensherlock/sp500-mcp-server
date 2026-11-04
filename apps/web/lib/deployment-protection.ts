import { getVercelOidcToken } from '@vercel/oidc'

// Resolve credentials per request/step, never in saved workflow data. Only send
// this project's credentials to deployment origins supplied by Vercel itself.
export async function deploymentProtectionHeaders(target: string | URL): Promise<Record<string, string>> {
  const url = new URL(target)
  const deploymentHosts = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]
  if (!deploymentHosts.some(host => host && url.origin === `https://${host}`)) return {}

  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET)
    return { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }

  if (process.env.VERCEL !== '1' && !process.env.VERCEL_OIDC_TOKEN) return {}

  return { 'x-vercel-trusted-oidc-idp-token': await getVercelOidcToken() }
}
