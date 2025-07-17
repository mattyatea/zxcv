import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class CreateTeamEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Teams"],
		summary: "Create a new team",
		security: [{ bearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z
								.string()
								.min(1)
								.max(50)
								.regex(/^[a-zA-Z0-9-_]+$/),
							displayName: z.string().min(1).max(100),
							description: z.string().max(500).optional(),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Team created successfully",
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
		const { name, displayName, description } = data.body;

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			const teamId = generateId();
			const now = Math.floor(Date.now() / 1000);

			const team = await prisma.team.create({
				data: {
					id: teamId,
					name,
					displayName: displayName,
					description: description || null,
					ownerId: user.id,
					createdAt: now,
					updatedAt: now,
				},
			});

			// Add the creator as a team member with admin role
			await prisma.teamMember.create({
				data: {
					id: generateId(),
					teamId: team.id,
					userId: user.id,
					role: "admin",
					joinedAt: now,
				},
			});

			return c.json(
				{
					id: team.id,
					name: team.name,
					displayName: team.displayName,
					description: team.description,
					ownerId: team.ownerId,
					createdAt: team.createdAt,
					updatedAt: team.updatedAt,
				},
				201 as const,
			);
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
