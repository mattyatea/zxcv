import type { PrismaClient } from "@prisma/client";
import { getLocaleFromRequest } from "../../utils/locale";
import { createPrismaClient } from "../../utils/prisma";
import { os } from "../index";

// Type for global test objects
declare global {
	var __mockPrismaClient: PrismaClient | undefined;
}

export const dbProvider = os.middleware(async ({ context, next }) => {
	// Use existing db if provided (for testing), otherwise create new one
	let db = context.db;

	// For testing: check if global mock Prisma client exists
	if (!db && globalThis.__mockPrismaClient) {
		db = globalThis.__mockPrismaClient;
	}

	// Only create Prisma client if db is not already provided and env.DB exists
	if (!db && context.env?.DB) {
		db = createPrismaClient(context.env.DB);
	}

	// If still no db, throw a descriptive error
	if (!db) {
		throw new Error("Database not available: neither context.db nor context.env.DB is provided");
	}

	// Auto-detect locale from request headers
	const request = context.cloudflare?.request;
	const locale = getLocaleFromRequest(request);

	return next({
		context: {
			...context,
			db,
			locale,
		},
	});
});
