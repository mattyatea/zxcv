import { os } from "~/server/orpc/index";
import { createPrismaClient } from "~/server/utils/prisma";

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
