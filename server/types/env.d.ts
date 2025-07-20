import type { PrismaClient } from "@prisma/client";

// EmailMessage type - will be imported dynamically in runtime
// biome-ignore lint/suspicious/noExplicitAny: EmailMessage type is from external Cloudflare module
type EmailMessage = any;

// Cloudflare Email Workers types
export interface SendEmailBinding {
	send(message: EmailMessage): Promise<void>;
}

// Cloudflare Environment type alias for better naming
export type CloudflareEnv = Env;

export interface Env {
	// D1 Database
	DB: D1Database;

	// R2 Bucket
	R2: R2Bucket;

	// KV Cache
	KV_CACHE: KVNamespace;

	// Email Sender
	EMAIL_SENDER: SendEmailBinding;

	// Environment Variables
	JWT_SECRET: string;
	JWT_ALGORITHM: string;
	JWT_EXPIRES_IN: string;
	RATE_LIMIT_ANONYMOUS: string;
	RATE_LIMIT_AUTHENTICATED: string;
	RATE_LIMIT_API_KEY: string;
	EMAIL_FROM: string;
	FRONTEND_URL: string;

	// OAuth Provider Settings
	APP_URL?: string;
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	GH_OAUTH_CLIENT_ID?: string;
	GH_OAUTH_CLIENT_SECRET?: string;

	// Prisma Client (optional, can be created on demand)
	prisma?: PrismaClient;
}
