import { ORPCError } from "@orpc/server";
import { os } from "~/server/orpc";

export const authRequired = os.middleware(async ({ context, next }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
	}

	return next({
		context: {
			...context,
			user: context.user,
		} as typeof context & { user: NonNullable<typeof context.user> },
	});
});

export const emailVerificationRequired = os.middleware(async ({ context, next }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
	}

	if (!context.user.emailVerified) {
		throw new ORPCError("FORBIDDEN", { message: "Email verification required" });
	}

	return next({
		context: {
			...context,
			user: context.user,
		} as typeof context & { user: NonNullable<typeof context.user> },
	});
});
