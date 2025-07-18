import type { AuthUser } from '~/server/utils/auth'

export interface Context {
  user?: AuthUser
  env: any
  cloudflare: {
    env: any
    request?: Request
  }
}