import type { PrismaClient } from "@prisma/client";

// Re-export Cloudflare's generated Env type for compatibility
export type { Env } from "../../worker-configuration.d.ts";

// Use Cloudflare's generated types from worker-configuration.d.ts
export type CloudflareEnv = Env;

// Extend the Cloudflare Env with optional runtime additions
export interface ExtendedEnv extends Env {
	// KV Cache (if needed for your application)
	KV_CACHE?: KVNamespace;

	// Prisma Client (optional, created on demand)
	prisma?: PrismaClient;
}
