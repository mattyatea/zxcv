import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class UpdateTeamEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Teams"],
		summary: "Update team details",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z
								.string()
								.min(1)
								.max(50)
								.regex(/^[a-zA-Z0-9-_]+$/)
								.optional(),
							displayName: z.string().min(1).max(100).optional(),
							description: z.string().max(500).optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Team updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							name: z.string(),
							displayName: z.string(),
							description: z.string().nullable(),
							ownerId: z.string(),
							createdAt: z.number(),
							updatedAt: z.number(),
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
				description: "Not authorized to update this team",
			},
			"404": {
				description: "Team not found",
			},
			"409": {
				description: "Team name already exists",
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
		const updates = data.body;

		if (!updates.name && !updates.displayName && updates.description === undefined) {
			return c.json({ error: "At least one field must be provided" }, 400 as const);
		}

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// First check if team exists
			const teamExists = await prisma.team.findUnique({
				where: { id },
			});

			if (!teamExists) {
				return c.json({ error: "Team not found" }, 404 as const);
			}

			// Check if user is owner or admin of this team
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
				return c.json({ error: "Not authorized to update this team" }, 403 as const);
			}

			// Check if new name already exists (if name is being updated)
			if (updates.name && updates.name !== team.name) {
				const existingTeam = await prisma.team.findFirst({
					where: {
						name: updates.name,
						id: {
							not: id,
						},
					},
				});

				if (existingTeam) {
					return c.json({ error: "Team name already exists" }, 409 as const);
				}
			}

			// Update team
			const updatedTeam = await prisma.team.update({
				where: { id },
				data: {
					...updates,
					updatedAt: Math.floor(Date.now() / 1000),
				},
			});

			return c.json({
				id: updatedTeam.id,
				name: updatedTeam.name,
				displayName: updatedTeam.displayName,
				description: updatedTeam.description,
				ownerId: updatedTeam.ownerId,
				createdAt: updatedTeam.createdAt,
				updatedAt: updatedTeam.updatedAt,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
