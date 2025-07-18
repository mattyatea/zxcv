import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { router } from '~/server/orpc/router'

export default defineNuxtPlugin(() => {
  const link = new RPCLink({
    url: '/rpc',
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