import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class UpdateTeamMemberEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Teams"],
		summary: "Update team member role",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
				userId: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							role: z.enum(["admin", "member"]),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Member role updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							user_id: z.string(),
							username: z.string(),
							email: z.string(),
							role: z.string(),
							joined_at: z.number(),
						}),
					},
				},
			},
			"400": {
				description: "Invalid input data",
			},
			"401": {
				description: "Authentication required",
			},
			"403": {
				description: "Not authorized to update member roles",
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
		const { role } = data.body;

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

			// Check if user can update member roles
			if (!isOwner && !isAdmin) {
				return c.json({ error: "Not authorized to update member roles" }, 403 as const);
			}

			// Cannot change owner's role
			if (userId === team.ownerId) {
				return c.json({ error: "Cannot change team owner's role" }, 403 as const);
			}

			// Check if the member to be updated exists
			const memberToUpdate = await prisma.teamMember.findFirst({
				where: {
					teamId: id,
					userId,
				},
				include: {
					user: {
						select: {
							username: true,
							email: true,
						},
					},
				},
			});

			if (!memberToUpdate) {
				return c.json({ error: "Member not found" }, 404 as const);
			}

			// Update member role
			const updatedMember = await prisma.teamMember.update({
				where: {
					id: memberToUpdate.id,
				},
				data: {
					role,
				},
			});

			return c.json({
				user_id: userId,
				username: memberToUpdate.user.username,
				email: memberToUpdate.user.email,
				role: updatedMember.role,
				joined_at: updatedMember.joinedAt,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
