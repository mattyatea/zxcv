import { createPrismaClient } from "../../utils/prisma";
import { os } from "../index";

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
