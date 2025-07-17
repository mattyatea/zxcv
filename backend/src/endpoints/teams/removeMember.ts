import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class RemoveTeamMemberEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Teams"],
		summary: "Remove member from team",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
				userId: z.string(),
			}),
		},
		responses: {
			"204": {
				description: "Member removed successfully",
			},
			"401": {
				description: "Authentication required",
			},
			"403": {
				description: "Not authorized to remove members",
			},
			"404": {
				description: "Team or member not found",
			},
		},
	};

	async handle(c: AppContext) {
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { id, userId } = data.params;

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// Get team and check authorization
			const team = await prisma.team.findFirst({
				where: { id },
				include: {
					members: {
						where: {
							userId: user.id,
						},
					},
				},
			});

			if (!team) {
				return c.json({ error: "Team not found" }, 404 as const);
			}

			const currentUserMember = team.members[0];
			const isOwner = team.ownerId === user.id;
			const isAdmin = currentUserMember?.role === "admin";

			// Users can remove themselves
			const isSelfRemoval = userId === user.id;

			// Check if user can remove members
			if (!isOwner && !isAdmin && !isSelfRemoval) {
				return c.json({ error: "Not authorized to remove members" }, 403 as const);
			}

			// Owner cannot be removed at all
			if (userId === team.ownerId) {
				return c.json({ error: "Cannot remove team owner" }, 400 as const);
			}

			// Check if the member to be removed exists
			const memberToRemove = await prisma.teamMember.findFirst({
				where: {
					teamId: id,
					userId,
				},
			});

			if (!memberToRemove) {
				return c.json({ error: "Member not found" }, 404 as const);
			}

			// Remove member
			await prisma.teamMember.delete({
				where: {
					id: memberToRemove.id,
				},
			});

			return c.body(null, 204 as const);
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
