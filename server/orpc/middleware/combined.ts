import { ORPCError } from "@orpc/server";
import { os } from "~/server/orpc";
import type { AuthUser } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";

// Database provider middleware (no auth required)
export const dbProvider = os.middleware(async ({ context, next }) => {
	// Use existing db if provided (for testing), otherwise create new one
	const db = context.db || createPrismaClient(context.env.DB);

	return next({
		context: {
			...context,
			db,
		},
	});
});

// Combined middleware that provides both db and ensures auth
export const dbWithAuth = os.middleware(async ({ context, next }) => {
	// Use existing db if provided (for testing), otherwise create new one
	const db = context.db || createPrismaClient(context.env.DB);

	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
	}

	return next({
		context: {
			...context,
			db,
			user: context.user as AuthUser, // Type assertion since we checked it exists
		},
	});
});

// Combined middleware that provides db and optionally has auth
export const dbWithOptionalAuth = os.middleware(async ({ context, next }) => {
	// Use existing db if provided (for testing), otherwise create new one
	const db = context.db || createPrismaClient(context.env.DB);

	return next({
		context: {
			...context,
			db,
			user: context.user,
		},
	});
});

// Combined middleware that provides db and ensures email verification
export const dbWithEmailVerification = os.middleware(async ({ context, next }) => {
	// Use existing db if provided (for testing), otherwise create new one
	const db = context.db || createPrismaClient(context.env.DB);

	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
	}

	if (!context.user.emailVerified) {
		throw new ORPCError("FORBIDDEN", { message: "Email verification required" });
	}

	return next({
		context: {
			...context,
			db,
			user: context.user as AuthUser, // Type assertion since we checked it exists
		},
	});
});
