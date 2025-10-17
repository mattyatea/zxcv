import type { PrismaClient } from "@prisma/client";
import { os } from "~/server/orpc/index";

// Test middleware that allows injecting a mock database
export const createTestDbProvider = (mockDb: PrismaClient) => {
	return os.middleware(async ({ context, next }) => {
		return next({
			context: {
				...context,
				db: mockDb,
			},
		});
	});
};
