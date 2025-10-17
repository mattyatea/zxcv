import { ORPCError } from "@orpc/server";
import { os } from "../index";

export const authRequiredMiddleware = os.$context().middleware(async ({ context, next }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "Authentication required",
		});
	}

	return next({
		context: {
			...context,
			user: context.user,
		},
	});
});

export const emailVerificationRequired = os.$context().middleware(async ({ context, next }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "Authentication required",
		});
	}

	if (!context.user.emailVerified) {
		throw new ORPCError("FORBIDDEN", {
			message: "Email verification required",
		});
	}

	return next({
		context: {
			...context,
			user: context.user,
		},
	});
});

export const adminAuthRequiredMiddleware = os.$context().middleware(async ({ context, next }) => {
	const user = context.user;

	if (!user || user.role !== "admin") {
		throw new ORPCError("UNAUTHORIZED", {
			message: "Authentication required",
		});
	}

	return next({
		context: {
			...context,
			user: context.user,
		},
	});
});
