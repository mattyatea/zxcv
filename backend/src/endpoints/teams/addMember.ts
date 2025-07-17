import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class AddTeamMemberEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Teams"],
		summary: "Add member to team",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							userId: z.string(),
							role: z.enum(["admin", "member"]).default("member"),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Member added successfully",
				content: {
					"application/json": {
						schema: z.object({
							userId: z.string(),
							username: z.string(),
							email: z.string(),
							role: z.string(),
							joinedAt: z.number(),
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
				description: "Not authorized to add members",
			},
			"404": {
				description: "Team or user not found",
			},
			"409": {
				description: "User is already a member",
			},
		},
	};

	async handle(c: AppContext) {
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;
		const { userId, role } = data.body;

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// Check if current user is owner or admin of this team
			const team = await prisma.team.findFirst({
				where: {
					id,
					OR: [
						{ ownerId: user.id },
						{
							members: {
								some: {
									userId: user.id,
									role: "admin",
								},
							},
						},
					],
				},
			});

			if (!team) {
				// Check if team exists
				const teamExists = await prisma.team.findUnique({
					where: { id },
				});

				if (!teamExists) {
					return c.json({ error: "Team not found" }, 404 as const);
				}

				return c.json({ error: "Not authorized to add members" }, 403 as const);
			}

			// Check if the user to be added exists
			const userToAdd = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					username: true,
					email: true,
				},
			});

			if (!userToAdd) {
				return c.json({ error: "User not found" }, 404 as const);
			}

			// Check if user is already a member
			const existingMember = await prisma.teamMember.findFirst({
				where: {
					teamId: id,
					userId: userId,
				},
			});

			if (existingMember) {
				return c.json({ error: "User is already a member" }, 409 as const);
			}

			// Add user to team
			const now = Math.floor(Date.now() / 1000);
			const teamMember = await prisma.teamMember.create({
				data: {
					id: generateId(),
					teamId: id,
					userId: userId,
					role,
					joinedAt: now,
				},
			});

			return c.json(
				{
					userId: userToAdd.id,
					username: userToAdd.username,
					email: userToAdd.email,
					role: teamMember.role,
					joinedAt: teamMember.joinedAt,
				},
				201 as const,
			);
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
