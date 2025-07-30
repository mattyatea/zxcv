import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

// Cache Prisma clients to avoid recreating them on every request
const prismaCache = new WeakMap<D1Database, PrismaClient>();

export function createPrismaClient(db: D1Database) {
	// Check if we already have a client for this database
	const cached = prismaCache.get(db);
	if (cached) {
		return cached;
	}

	// Create new client and cache it
	const adapter = new PrismaD1(db);
	const client = new PrismaClient({
		adapter,
		// Disable query logging in production to save CPU
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

	prismaCache.set(db, client);
	return client;
}
