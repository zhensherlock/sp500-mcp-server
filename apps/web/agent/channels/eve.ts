import { eveChannel } from 'eve/channels/eve'
import { isPlaygroundProxyRequest, visitorFromRequest } from '@/lib/playground/auth'

export default eveChannel({
  auth: request => {
    const principalId = visitorFromRequest(request)
    if (!principalId || !isPlaygroundProxyRequest(request, principalId)) return null
    return principalId
      ? { principalId, principalType: 'user', authenticator: 'playground-cookie', attributes: {} }
      : null
  },
})
