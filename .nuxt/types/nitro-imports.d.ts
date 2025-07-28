declare global {
  const Cache: typeof import('../../server/utils/cache')['Cache']
  const EmailService: typeof import('../../server/utils/email')['EmailService']
  const LogLevel: typeof import('../../server/utils/logger')['LogLevel']
  const Logger: typeof import('../../server/utils/logger')['Logger']
  const OAUTH_CONFIG: typeof import('../../server/utils/oauthSecurity')['OAUTH_CONFIG']
  const __buildAssetsURL: typeof import('../../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/core/runtime/nitro/utils/paths')['buildAssetsURL']
  const __publicAssetsURL: typeof import('../../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/core/runtime/nitro/utils/paths')['publicAssetsURL']
  const appendCorsHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['appendCorsHeaders']
  const appendCorsPreflightHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['appendCorsPreflightHeaders']
  const appendHeader: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['appendHeader']
  const appendHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['appendHeaders']
  const appendResponseHeader: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['appendResponseHeader']
  const appendResponseHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['appendResponseHeaders']
  const assertMethod: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['assertMethod']
  const authErrors: typeof import('../../server/utils/i18n')['authErrors']
  const cachedEventHandler: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/cache')['cachedEventHandler']
  const cachedFunction: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/cache')['cachedFunction']
  const callNodeListener: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['callNodeListener']
  const canDeleteOrganizationRule: typeof import('../../server/utils/organizations')['canDeleteOrganizationRule']
  const canEditOrganizationRule: typeof import('../../server/utils/organizations')['canEditOrganizationRule']
  const canViewOrganizationRule: typeof import('../../server/utils/organizations')['canViewOrganizationRule']
  const checkNamespaceAvailable: typeof import('../../server/utils/namespace')['checkNamespaceAvailable']
  const checkOrganizationMembership: typeof import('../../server/utils/organizations')['checkOrganizationMembership']
  const cleanupExpiredOAuthStates: typeof import('../../server/utils/oauthCleanup')['cleanupExpiredOAuthStates']
  const clearResponseHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['clearResponseHeaders']
  const clearSession: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['clearSession']
  const comparePassword: typeof import('../../server/utils/crypto')['comparePassword']
  const createApp: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['createApp']
  const createAppEventHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['createAppEventHandler']
  const createCache: typeof import('../../server/utils/cache')['createCache']
  const createError: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['createError']
  const createErrorResponse: typeof import('../../server/utils/errorHandler')['createErrorResponse']
  const createEvent: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['createEvent']
  const createEventStream: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['createEventStream']
  const createJWT: typeof import('../../server/utils/jwt')['createJWT']
  const createLogger: typeof import('../../server/utils/logger')['createLogger']
  const createOAuthProviders: typeof import('../../server/utils/oauth')['createOAuthProviders']
  const createPrismaClient: typeof import('../../server/utils/prisma')['createPrismaClient']
  const createRefreshToken: typeof import('../../server/utils/jwt')['createRefreshToken']
  const createRouter: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['createRouter']
  const defaultContentType: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['defaultContentType']
  const defineAppConfig: typeof import('../../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/core/runtime/nitro/utils/config')['defineAppConfig']
  const defineCachedEventHandler: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/cache')['defineCachedEventHandler']
  const defineCachedFunction: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/cache')['defineCachedFunction']
  const defineEventHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['defineEventHandler']
  const defineLazyEventHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['defineLazyEventHandler']
  const defineNitroErrorHandler: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/error/utils')['defineNitroErrorHandler']
  const defineNitroPlugin: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/plugin')['defineNitroPlugin']
  const defineNodeListener: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['defineNodeListener']
  const defineNodeMiddleware: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['defineNodeMiddleware']
  const defineRenderHandler: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/renderer')['defineRenderHandler']
  const defineRequestMiddleware: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['defineRequestMiddleware']
  const defineResponseMiddleware: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['defineResponseMiddleware']
  const defineRouteMeta: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/meta')['defineRouteMeta']
  const defineTask: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/task')['defineTask']
  const defineWebSocket: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['defineWebSocket']
  const defineWebSocketHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['defineWebSocketHandler']
  const deleteCookie: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['deleteCookie']
  const detectLocaleFromHeader: typeof import('../../server/utils/locale')['detectLocaleFromHeader']
  const dynamicEventHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['dynamicEventHandler']
  const emailSchema: typeof import('../../server/utils/validation')['emailSchema']
  const eventHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['eventHandler']
  const fetchWithEvent: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['fetchWithEvent']
  const fromNodeMiddleware: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['fromNodeMiddleware']
  const fromPlainHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['fromPlainHandler']
  const fromWebHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['fromWebHandler']
  const generateCodeVerifier: typeof import('../../server/utils/oauth')['generateCodeVerifier']
  const generateId: typeof import('../../server/utils/crypto')['generateId']
  const generateNonce: typeof import('../../server/utils/oauthSecurity')['generateNonce']
  const generateState: typeof import('../../server/utils/oauth')['generateState']
  const generateStateSignature: typeof import('../../server/utils/oauth')['generateStateSignature']
  const generateToken: typeof import('../../server/utils/jwt')['generateToken']
  const getAuthFromEvent: typeof import('../../server/utils/auth')['getAuthFromEvent']
  const getCookie: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getCookie']
  const getHeader: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getHeader']
  const getHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getHeaders']
  const getLocaleFromHeader: typeof import('../../server/utils/i18n')['getLocaleFromHeader']
  const getLocaleFromRequest: typeof import('../../server/utils/locale')['getLocaleFromRequest']
  const getMethod: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getMethod']
  const getProxyRequestHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getProxyRequestHeaders']
  const getQuery: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getQuery']
  const getRequestFingerprint: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRequestFingerprint']
  const getRequestHeader: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRequestHeader']
  const getRequestHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRequestHeaders']
  const getRequestHost: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRequestHost']
  const getRequestIP: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRequestIP']
  const getRequestPath: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRequestPath']
  const getRequestProtocol: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRequestProtocol']
  const getRequestURL: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRequestURL']
  const getRequestWebStream: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRequestWebStream']
  const getResponseHeader: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getResponseHeader']
  const getResponseHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getResponseHeaders']
  const getResponseStatus: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getResponseStatus']
  const getResponseStatusText: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getResponseStatusText']
  const getRouteRules: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/route-rules')['getRouteRules']
  const getRouterParam: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRouterParam']
  const getRouterParams: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getRouterParams']
  const getSession: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getSession']
  const getValidatedQuery: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getValidatedQuery']
  const getValidatedRouterParams: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['getValidatedRouterParams']
  const handleAuthError: typeof import('../../server/utils/errorHandler')['handleAuthError']
  const handleCacheHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['handleCacheHeaders']
  const handleCors: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['handleCors']
  const handleDatabaseError: typeof import('../../server/utils/errorHandler')['handleDatabaseError']
  const handleNotFoundError: typeof import('../../server/utils/errorHandler')['handleNotFoundError']
  const handlePermissionError: typeof import('../../server/utils/errorHandler')['handlePermissionError']
  const handleRateLimitError: typeof import('../../server/utils/errorHandler')['handleRateLimitError']
  const handleValidationError: typeof import('../../server/utils/errorHandler')['handleValidationError']
  const hashApiKey: typeof import('../../server/utils/crypto')['hashApiKey']
  const hashContent: typeof import('../../server/utils/crypto')['hashContent']
  const hashPassword: typeof import('../../server/utils/crypto')['hashPassword']
  const idSchema: typeof import('../../server/utils/validation')['idSchema']
  const isCorsOriginAllowed: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['isCorsOriginAllowed']
  const isError: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['isError']
  const isEvent: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['isEvent']
  const isEventHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['isEventHandler']
  const isMethod: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['isMethod']
  const isOrganizationOwner: typeof import('../../server/utils/organizations')['isOrganizationOwner']
  const isPreflightRequest: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['isPreflightRequest']
  const isPrismaError: typeof import('../../server/utils/errorHandler')['isPrismaError']
  const isStream: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['isStream']
  const isWebResponse: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['isWebResponse']
  const lazyEventHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['lazyEventHandler']
  const localeSchema: typeof import('../../server/utils/validation')['localeSchema']
  const nitroPlugin: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/plugin')['nitroPlugin']
  const organizationNameSchema: typeof import('../../server/utils/validation')['organizationNameSchema']
  const paginationSchema: typeof import('../../server/utils/validation')['paginationSchema']
  const parseCookies: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['parseCookies']
  const parseRulePath: typeof import('../../server/utils/namespace')['parseRulePath']
  const passwordSchema: typeof import('../../server/utils/validation')['passwordSchema']
  const performOAuthSecurityChecks: typeof import('../../server/utils/oauthSecurity')['performOAuthSecurityChecks']
  const promisifyNodeListener: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['promisifyNodeListener']
  const proxyRequest: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['proxyRequest']
  const readBody: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['readBody']
  const readFormData: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['readFormData']
  const readMultipartFormData: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['readMultipartFormData']
  const readRawBody: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['readRawBody']
  const readValidatedBody: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['readValidatedBody']
  const removeResponseHeader: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['removeResponseHeader']
  const requestTimingMiddleware: typeof import('../../server/utils/logger')['requestTimingMiddleware']
  const requireAuth: typeof import('../../server/utils/auth')['requireAuth']
  const requireEmailVerification: typeof import('../../server/utils/auth')['requireEmailVerification']
  const requireScope: typeof import('../../server/utils/auth')['requireScope']
  const ruleNameSchema: typeof import('../../server/utils/validation')['ruleNameSchema']
  const runTask: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/task')['runTask']
  const safeCompare: typeof import('../../server/utils/oauth')['safeCompare']
  const sanitizeStatusCode: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sanitizeStatusCode']
  const sanitizeStatusMessage: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sanitizeStatusMessage']
  const sealSession: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sealSession']
  const send: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['send']
  const sendEmail: typeof import('../../server/utils/email')['sendEmail']
  const sendError: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sendError']
  const sendIterable: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sendIterable']
  const sendNoContent: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sendNoContent']
  const sendProxy: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sendProxy']
  const sendRedirect: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sendRedirect']
  const sendStream: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sendStream']
  const sendWebResponse: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['sendWebResponse']
  const serveStatic: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['serveStatic']
  const setCookie: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['setCookie']
  const setHeader: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['setHeader']
  const setHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['setHeaders']
  const setResponseHeader: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['setResponseHeader']
  const setResponseHeaders: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['setResponseHeaders']
  const setResponseStatus: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['setResponseStatus']
  const splitCookiesString: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['splitCookiesString']
  const t: typeof import('../../server/utils/i18n')['t']
  const tagsSchema: typeof import('../../server/utils/validation')['tagsSchema']
  const toEventHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['toEventHandler']
  const toNodeListener: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['toNodeListener']
  const toPlainHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['toPlainHandler']
  const toWebHandler: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['toWebHandler']
  const toWebRequest: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['toWebRequest']
  const unsealSession: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['unsealSession']
  const updateSession: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['updateSession']
  const useAppConfig: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/config')['useAppConfig']
  const useBase: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['useBase']
  const useEvent: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/context')['useEvent']
  const useNitroApp: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/app')['useNitroApp']
  const useRuntimeConfig: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/config')['useRuntimeConfig']
  const useSession: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['useSession']
  const useStorage: typeof import('../../node_modules/.pnpm/nitropack@2.12.3_@netlify+blobs@9.1.2/node_modules/nitropack/dist/runtime/internal/storage')['useStorage']
  const usernameSchema: typeof import('../../server/utils/validation')['usernameSchema']
  const validateFields: typeof import('../../server/utils/validation')['validateFields']
  const validateOAuthResponse: typeof import('../../server/utils/oauthSecurity')['validateOAuthResponse']
  const validateRedirectUrl: typeof import('../../server/utils/oauthSecurity')['validateRedirectUrl']
  const validateRuleOwnership: typeof import('../../server/utils/namespace')['validateRuleOwnership']
  const validateSafe: typeof import('../../server/utils/validation')['validateSafe']
  const validateWithError: typeof import('../../server/utils/validation')['validateWithError']
  const verifyJWT: typeof import('../../server/utils/jwt')['verifyJWT']
  const verifyPassword: typeof import('../../server/utils/crypto')['verifyPassword']
  const verifyRefreshToken: typeof import('../../server/utils/jwt')['verifyRefreshToken']
  const verifyStateSignature: typeof import('../../server/utils/oauth')['verifyStateSignature']
  const verifyToken: typeof import('../../server/utils/jwt')['verifyToken']
  const visibilitySchema: typeof import('../../server/utils/validation')['visibilitySchema']
  const writeEarlyHints: typeof import('../../node_modules/.pnpm/h3@1.15.3/node_modules/h3')['writeEarlyHints']
}
// for type re-export
declare global {
  // @ts-ignore
  export type { AuthUser, AuthContext } from '../../server/utils/auth'
  import('../../server/utils/auth')
  // @ts-ignore
  export type { Cache, CacheOptions } from '../../server/utils/cache'
  import('../../server/utils/cache')
  // @ts-ignore
  export type { EmailService, EmailTemplate, PasswordResetEmailData, EmailVerificationData, OrganizationInvitationData } from '../../server/utils/email'
  import('../../server/utils/email')
  // @ts-ignore
  export type { ErrorResponse } from '../../server/utils/errorHandler'
  import('../../server/utils/errorHandler')
  // @ts-ignore
  export type { JWTPayload } from '../../server/utils/jwt'
  import('../../server/utils/jwt')
  // @ts-ignore
  export type { Locale } from '../../server/utils/locale'
  import('../../server/utils/locale')
  // @ts-ignore
  export type { LogLevel, Logger, LogEntry } from '../../server/utils/logger'
  import('../../server/utils/logger')
  // @ts-ignore
  export type { OrganizationMember } from '../../server/utils/organizations'
  import('../../server/utils/organizations')
}
export { useNitroApp } from 'nitropack/runtime/internal/app';
export { useRuntimeConfig, useAppConfig } from 'nitropack/runtime/internal/config';
export { defineNitroPlugin, nitroPlugin } from 'nitropack/runtime/internal/plugin';
export { defineCachedFunction, defineCachedEventHandler, cachedFunction, cachedEventHandler } from 'nitropack/runtime/internal/cache';
export { useStorage } from 'nitropack/runtime/internal/storage';
export { defineRenderHandler } from 'nitropack/runtime/internal/renderer';
export { defineRouteMeta } from 'nitropack/runtime/internal/meta';
export { getRouteRules } from 'nitropack/runtime/internal/route-rules';
export { useEvent } from 'nitropack/runtime/internal/context';
export { defineTask, runTask } from 'nitropack/runtime/internal/task';
export { defineNitroErrorHandler } from 'nitropack/runtime/internal/error/utils';
export { appendCorsHeaders, appendCorsPreflightHeaders, appendHeader, appendHeaders, appendResponseHeader, appendResponseHeaders, assertMethod, callNodeListener, clearResponseHeaders, clearSession, createApp, createAppEventHandler, createError, createEvent, createEventStream, createRouter, defaultContentType, defineEventHandler, defineLazyEventHandler, defineNodeListener, defineNodeMiddleware, defineRequestMiddleware, defineResponseMiddleware, defineWebSocket, defineWebSocketHandler, deleteCookie, dynamicEventHandler, eventHandler, fetchWithEvent, fromNodeMiddleware, fromPlainHandler, fromWebHandler, getCookie, getHeader, getHeaders, getMethod, getProxyRequestHeaders, getQuery, getRequestFingerprint, getRequestHeader, getRequestHeaders, getRequestHost, getRequestIP, getRequestPath, getRequestProtocol, getRequestURL, getRequestWebStream, getResponseHeader, getResponseHeaders, getResponseStatus, getResponseStatusText, getRouterParam, getRouterParams, getSession, getValidatedQuery, getValidatedRouterParams, handleCacheHeaders, handleCors, isCorsOriginAllowed, isError, isEvent, isEventHandler, isMethod, isPreflightRequest, isStream, isWebResponse, lazyEventHandler, parseCookies, promisifyNodeListener, proxyRequest, readBody, readFormData, readMultipartFormData, readRawBody, readValidatedBody, removeResponseHeader, sanitizeStatusCode, sanitizeStatusMessage, sealSession, send, sendError, sendIterable, sendNoContent, sendProxy, sendRedirect, sendStream, sendWebResponse, serveStatic, setCookie, setHeader, setHeaders, setResponseHeader, setResponseHeaders, setResponseStatus, splitCookiesString, toEventHandler, toNodeListener, toPlainHandler, toWebHandler, toWebRequest, unsealSession, updateSession, useBase, useSession, writeEarlyHints } from 'h3';
export { buildAssetsURL as __buildAssetsURL, publicAssetsURL as __publicAssetsURL } from '/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/core/runtime/nitro/utils/paths';
export { defineAppConfig } from '/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/core/runtime/nitro/utils/config';
export { getAuthFromEvent, requireAuth, requireEmailVerification, requireScope } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/auth';
export { Cache, createCache } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/cache';
export { hashPassword, verifyPassword, generateId, hashApiKey, hashContent, comparePassword } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/crypto';
export { sendEmail, EmailService } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/email';
export { handleDatabaseError, isPrismaError, handleValidationError, handleAuthError, handlePermissionError, handleNotFoundError, handleRateLimitError, createErrorResponse } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/errorHandler';
export { t, getLocaleFromHeader, authErrors } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/i18n';
export { createJWT, verifyJWT, createRefreshToken, verifyRefreshToken, generateToken, verifyToken } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/jwt';
export { detectLocaleFromHeader, getLocaleFromRequest } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/locale';
export { LogLevel, Logger, createLogger, requestTimingMiddleware } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/logger';
export { parseRulePath, validateRuleOwnership, checkNamespaceAvailable } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/namespace';
export { createOAuthProviders, generateState, generateStateSignature, verifyStateSignature, safeCompare, generateCodeVerifier } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/oauth';
export { cleanupExpiredOAuthStates } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/oauthCleanup';
export { OAUTH_CONFIG, validateRedirectUrl, performOAuthSecurityChecks, generateNonce, validateOAuthResponse } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/oauthSecurity';
export { checkOrganizationMembership, canViewOrganizationRule, canEditOrganizationRule, canDeleteOrganizationRule, isOrganizationOwner } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/organizations';
export { createPrismaClient } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/prisma';
export { emailSchema, passwordSchema, usernameSchema, organizationNameSchema, ruleNameSchema, paginationSchema, idSchema, tagsSchema, localeSchema, visibilitySchema, validateWithError, validateSafe, validateFields } from '/Users/sou_kohata/WebstormProjects/zxcv/server/utils/validation';