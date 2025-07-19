import { os } from "~/server/orpc/index";
import { createPrismaClient } from "~/server/utils/prisma";

export const dbProvider = os.middleware(async ({ context, next }) => {
	const db = createPrismaClient(context.env.DB);

	return next({
		context: {
			...context,
			db,
		},
	});
});
