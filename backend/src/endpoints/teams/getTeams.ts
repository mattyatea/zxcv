import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

interface TeamWithCount {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	ownerId: string;
	createdAt: number;
	updatedAt: number;
	members: Array<{ role: string }>;
	// biome-ignore lint/style/useNamingConvention: Prisma generated field
	_count: {
		members: number;
	};
}

export class GetTeamsEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Teams"],
		summary: "Get teams for current user",
		security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				limit: z.string().optional().default("20"),
				offset: z.string().optional().default("0"),
			}),
		},
		responses: {
			"200": {
				description: "Teams retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							results: z.array(
								z.object({
									id: z.string(),
									name: z.string(),
									displayName: z.string(),
									description: z.string().nullable(),
									ownerId: z.string(),
									createdAt: z.number(),
									updatedAt: z.number(),
									role: z.string(), // User's role in the team
									memberCount: z.number(),
								}),
							),
							total: z.number(),
							limit: z.number(),
							offset: z.number(),
						}),
					},
				},
			},
			"401": {
				description: "Authentication required",
			},
		},
	};

	async handle(c: AppContext) {
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const limit = Number.parseInt(data.query.limit);
		const offset = Number.parseInt(data.query.offset);

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// Get teams where user is a member
			const teamsWithRole = await prisma.team.findMany({
				where: {
					members: {
						some: {
							userId: user.id,
						},
					},
				},
				include: {
					members: {
						where: {
							userId: user.id,
						},
						select: {
							role: true,
						},
					},
					// biome-ignore lint/style/useNamingConvention: Prisma generated field
					_count: {
						select: {
							members: true,
						},
					},
				},
				skip: offset,
				take: limit,
				orderBy: {
					updatedAt: "desc",
				},
			});

			// Get total count
			const totalCount = await prisma.team.count({
				where: {
					members: {
						some: {
							userId: user.id,
						},
					},
				},
			});

			const results = teamsWithRole.map((team: TeamWithCount) => ({
				id: team.id,
				name: team.name,
				displayName: team.displayName,
				description: team.description,
				ownerId: team.ownerId,
				createdAt: team.createdAt,
				updatedAt: team.updatedAt,
				role: team.members[0]?.role || "member",
				memberCount: team._count.members,
			}));

			return c.json({
				results,
				total: totalCount,
				limit,
				offset,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
