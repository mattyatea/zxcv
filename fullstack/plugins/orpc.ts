import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { router } from '~/server/orpc/router'

export default defineNuxtPlugin((nuxtApp) => {
  const requestURL = useRequestURL()
  
  // SSRとクライアントで適切なURLを構築
  const baseURL = process.server
    ? `${requestURL.protocol}//${requestURL.host}`
    : window.location.origin
  
  const link = new RPCLink({
    url: `${baseURL}/rpc`,
    headers: () => {
      const token = process.client ? localStorage.getItem('token') : null
      return token ? { Authorization: `Bearer ${token}` } : {}
    }
  })

  const rpcClient = createORPCClient<typeof router>(link)

  return {
    provide: {
      rpc: rpcClient
    }
  }
})