// declare module "cloudflare:test" {
//   export const env: {
//     DB: D1Database;
//     R2: R2Bucket;
//     EMAIL_SENDER: SendEmail;
//     KV_CACHE: KVNamespace;
//     JWT_SECRET: string;
//     JWT_ALGORITHM: string;
//     JWT_EXPIRES_IN: string;
//     EMAIL_FROM: string;
//     FRONTEND_URL: string;
//     RATE_LIMIT_ANONYMOUS: string;
//     RATE_LIMIT_AUTHENTICATED: string;
//     RATE_LIMIT_API_KEY: string;
//     MIGRATIONS: string[];
//   };
//
//   export const SELF: {
//     fetch: (request: Request) => Promise<Response>;
//   };
//
//   export function applyD1Migrations(
//     db: D1Database,
//     migrations: string[]
//   ): Promise<void>;
// }
