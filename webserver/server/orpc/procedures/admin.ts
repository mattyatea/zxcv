import { ORPCError } from "@orpc/server";
import { os } from "../index";
import { dbWithAdminAuth } from "../middleware/combined";

const ADMIN_ROLE = "admin";
const MODERATOR_ROLE = "moderator";
const USER_ROLE = "user";

export const adminProcedures = {
	getModerators: os.admin.getModerators.use(dbWithAdminAuth).handler(async ({ context }) => {
		const { db } = context;

		const moderators = await db.user.findMany({
			where: {
				role: {
					in: [MODERATOR_ROLE, ADMIN_ROLE],
				},
			},
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return moderators.map((user) => ({
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
		}));
	}),

	assignModerator: os.admin.assignModerator
		.use(dbWithAdminAuth)
		.handler(async ({ input, context }) => {
			const { db } = context;
			const { userId } = input;

			const user = await db.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					role: true,
				},
			});

			if (!user) {
				throw new ORPCError("NOT_FOUND", { message: "User not found" });
			}

			if (user.role === ADMIN_ROLE) {
				throw new ORPCError("FORBIDDEN", { message: "Admins cannot be reassigned" });
			}

			if (user.role !== MODERATOR_ROLE) {
				await db.user.update({
					where: { id: userId },
					data: { role: MODERATOR_ROLE },
				});
			}

			return { success: true, message: "Moderator assigned successfully" };
		}),

	removeModerator: os.admin.removeModerator
		.use(dbWithAdminAuth)
		.handler(async ({ input, context }) => {
			const { db } = context;
			const { userId } = input;

			const user = await db.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					role: true,
				},
			});

			if (!user) {
				throw new ORPCError("NOT_FOUND", { message: "User not found" });
			}

			if (user.role === ADMIN_ROLE) {
				throw new ORPCError("FORBIDDEN", { message: "Admin role cannot be removed" });
			}

			if (user.role !== MODERATOR_ROLE) {
				throw new ORPCError("BAD_REQUEST", { message: "User is not a moderator" });
			}

			await db.user.update({
				where: { id: userId },
				data: { role: USER_ROLE },
			});

			return { success: true, message: "Moderator role removed successfully" };
		}),
};
