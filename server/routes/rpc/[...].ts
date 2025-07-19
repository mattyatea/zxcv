import { RPCHandler } from '@orpc/server/fetch'
import { router } from '~/server/orpc/router'
import { verifyJWT } from '~/server/utils/jwt'
import { getHeader, defineEventHandler, setResponseStatus, readRawBody, setHeader } from 'h3'
import type { H3Event } from 'h3'
import type { AuthUser } from '~/server/utils/auth'
import type { H3EventContext } from '~/server/types/bindings'

async function getAuthUser(event: H3Event): Promise<AuthUser | undefined> {
  const authorization = getHeader(event, 'authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return undefined
  }

  const token = authorization.substring(7)
  const context = event.context as H3EventContext
  const env = context.cloudflare.env

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
  console.log('ORPC Handler - URL:', event.node.req.url)
  console.log('ORPC Handler - Method:', event.node.req.method)
  
  // In test environment, ensure context is properly set
  const context = event.context as H3EventContext
  
  // Ensure cloudflare context exists
  if (!context.cloudflare) {
    // In test environment, set up minimal cloudflare context
    const testEnv = {
      DB: globalThis.DB,
      R2: globalThis.R2,
      EMAIL_SENDER: globalThis.EMAIL_SENDER,
      KV_CACHE: globalThis.KV_CACHE,
      JWT_SECRET: globalThis.JWT_SECRET || 'test-secret',
      JWT_ALGORITHM: 'HS256',
      JWT_EXPIRES_IN: '1h',
      EMAIL_FROM: 'test@example.com',
      FRONTEND_URL: 'http://localhost:3000',
      RATE_LIMIT_ANONYMOUS: '100',
      RATE_LIMIT_AUTHENTICATED: '1000',
      RATE_LIMIT_API_KEY: '5000'
    }
    
    context.cloudflare = {
      env: testEnv,
      cf: {} as any,
      ctx: {
        waitUntil: () => {},
        passThroughOnException: () => {}
      } as any,
      caches: {} as any
    }
  }
  
  try {
    const user = await getAuthUser(event)
    
    // Convert H3 event to a standard Request object for the fetch adapter
    const url = new URL(event.node.req.url || '', `http://${event.node.req.headers.host || 'localhost'}`)
    const headers = new Headers()
    
    // Copy headers from the H3 event
    for (const [key, value] of Object.entries(event.node.req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : String(value))
      }
    }
    
    // Create a Request object
    const request = new Request(url, {
      method: event.node.req.method,
      headers,
      body: event.node.req.method !== 'GET' && event.node.req.method !== 'HEAD' 
        ? await readRawBody(event) 
        : undefined
    })
    
    const response = await handler.handle(request, {
      prefix: '/rpc',
      context: {
        user,
        env: context.cloudflare.env,
        cloudflare: context.cloudflare
      }
    })

    if (!response.matched) {
      setResponseStatus(event, 404, 'Not Found')
      return { error: 'Not found' }
    }
    
    // Send the fetch Response back through H3
    setResponseStatus(event, response.response.status)
    
    // Set response headers
    response.response.headers.forEach((value, key) => {
      setHeader(event, key, value)
    })
    
    // Return the response body
    const body = await response.response.text()
    return body
  } catch (error) {
    console.error('RPC Handler Error:', error)
    throw error
  }
})