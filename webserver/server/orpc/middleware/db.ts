import type { PrismaClient } from "@prisma/client";
import { createPrismaClient } from "../../utils/prisma";
import { os } from "../index";

// Type for global test objects
declare global {
	var __mockPrismaClient: PrismaClient | undefined;
}

export const dbProvider = os.$context().middleware(async ({ context, next }) => {
	const db = createPrismaClient(context.env.DB);

	// If still no db, throw a descriptive error
	if (!db) {
		throw new Error("Database not available: neither context.db nor context.env.DB is provided");
	}

	return next({
		context: {
			...context,
			db,
			env: context.env,
			user: context.user || undefined,
		},
	});
});
