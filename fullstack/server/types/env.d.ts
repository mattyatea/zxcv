import type { PrismaClient } from "@prisma/client";
import type { EmailMessage } from "cloudflare:email";

// Cloudflare Email Workers types
export interface SendEmailBinding {
	send(message: EmailMessage): Promise<void>;
}

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

	// Prisma Client (optional, can be created on demand)
	prisma?: PrismaClient;
}
