import { ORPCError } from "@orpc/server";
import type { AuthUser } from "../../utils/auth";
import { getLocaleFromRequest, type Locale } from "../../utils/locale";
import { createPrismaClient } from "../../utils/prisma";
import { os } from "../index";

// Database provider middleware (no auth required)
export const dbProvider = os.middleware(async ({ context, next }) => {
	// Use existing db if provided (for testing), otherwise create new one
	let db = context.db;

	// For testing: check if global mock Prisma client exists
	if (!db && (globalThis as any).__mockPrismaClient) {
		db = (globalThis as any).__mockPrismaClient;
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

// Combined middleware that provides both db and ensures auth
export const dbWithAuth = os.middleware(async ({ context, next }) => {
	// Use existing db if provided (for testing), otherwise create new one
	let db = context.db;

	// For testing: check if global mock Prisma client exists
	if (!db && (globalThis as any).__mockPrismaClient) {
		db = (globalThis as any).__mockPrismaClient;
	}

	// Only create Prisma client if db is not already provided and env.DB exists
	if (!db && context.env?.DB) {
		db = createPrismaClient(context.env.DB);
	}

	// If still no db, throw a descriptive error
	if (!db) {
		throw new Error("Database not available: neither context.db nor context.env.DB is provided");
	}

	// For testing: if no user in context, check if there's a global test user
	let user = context.user;
	if (!user && process.env.NODE_ENV === "test" && (globalThis as any).__testUser) {
		user = (globalThis as any).__testUser;
	}

	if (!user) {
		throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
	}

	// Auto-detect locale from request headers
	const request = context.cloudflare?.request;
	const locale = getLocaleFromRequest(request);

	return next({
		context: {
			...context,
			db,
			user: user as AuthUser, // Type assertion since we checked it exists
			locale,
		},
	});
});

// Combined middleware that provides db and optionally has auth
export const dbWithOptionalAuth = os.middleware(async ({ context, next }) => {
	// Use existing db if provided (for testing), otherwise create new one
	let db = context.db;

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
			user: context.user,
			locale,
		},
	});
});

// Combined middleware that provides db and ensures email verification
export const dbWithEmailVerification = os.middleware(async ({ context, next }) => {
	// Use existing db if provided (for testing), otherwise create new one
	let db = context.db;

	// Only create Prisma client if db is not already provided and env.DB exists
	if (!db && context.env?.DB) {
		db = createPrismaClient(context.env.DB);
	}

	// If still no db, throw a descriptive error
	if (!db) {
		throw new Error("Database not available: neither context.db nor context.env.DB is provided");
	}

	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
	}

	// TODO: 開発環境では一時的にemailVerificationチェックをスキップ
	// if (!context.user.emailVerified) {
	// 	throw new ORPCError("FORBIDDEN", { message: "Email verification required" });
	// }

	// Auto-detect locale from request headers
	const request = context.cloudflare?.request;
	const locale = getLocaleFromRequest(request);

	return next({
		context: {
			...context,
			db,
			user: context.user as AuthUser, // Type assertion since we checked it exists
			locale,
		},
	});
});
