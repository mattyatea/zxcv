import { RPCHandler } from '@orpc/server/node'
import { router } from '~/server/orpc/router'
import { verifyJWT } from '~/server/utils/jwt'
import type { H3Event } from 'h3'
import type { AuthUser } from '~/server/utils/auth'

async function getAuthUser(event: H3Event): Promise<AuthUser | undefined> {
  const authorization = getHeader(event, 'authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return undefined
  }

  const token = authorization.substring(7)
  const context = event.context as any
  const env = context.cloudflare?.env

  if (!env) {
    return undefined
  }

  try {
    const payload = await verifyJWT(token, env)
    if (!payload) {
      return undefined
    }
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      emailVerified: payload.emailVerified || false
    }
  } catch {
    return undefined
  }
}

const handler = new RPCHandler(router)

export default defineEventHandler(async (event) => {
  const context = event.context as any
  const user = await getAuthUser(event)

  const { matched } = await handler.handle(
    event.node.req,
    event.node.res,
    {
      prefix: '/rpc',
      context: {
        user,
        env: context.cloudflare?.env,
        cloudflare: context.cloudflare
      }
    }
  )

  if (matched) {
    return
  }

  setResponseStatus(event, 404, 'Not Found')
  return 'Not found'
})