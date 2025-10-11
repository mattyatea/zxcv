import { ORPCError } from "@orpc/server";
import { os } from "../index";

const ADMIN_ROLE = "admin";
const MODERATOR_ROLE = "moderator";

export const adminRequired = os.middleware(async ({ context, next }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
	}

	if (context.user.role !== ADMIN_ROLE) {
		throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
	}

	return next({
		context,
	});
});
export const moderatorRequired = os.middleware(async ({ context, next }) => {
	const { user } = context;

	if (!user) {
		throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
	}

	if (user.role !== MODERATOR_ROLE && user.role !== ADMIN_ROLE) {
		throw new ORPCError("FORBIDDEN", { message: "Moderator access required" });
	}

	return next({
		context,
	});
});
