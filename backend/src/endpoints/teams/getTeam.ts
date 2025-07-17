import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

interface TeamWithDetails {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	ownerId: string;
	createdAt: number;
	updatedAt: number;
	members: Array<{
		userId: string;
		role: string;
		joinedAt: number;
		user: {
			username: string;
			email: string;
		};
	}>;
	// biome-ignore lint/style/useNamingConvention: Prisma generated field
	_count: {
		rules: number;
	};
}

export class GetTeamEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Teams"],
		summary: "Get team details",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Team details retrieved successfully",
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
							role: z.string(), // User's role in the team
							members: z.array(
								z.object({
									userId: z.string(),
									username: z.string(),
									email: z.string(),
									role: z.string(),
									joinedAt: z.number(),
								}),
							),
							ruleCount: z.number(),
						}),
					},
				},
			},
			"401": {
				description: "Authentication required",
			},
			"403": {
				description: "Not a member of this team",
			},
			"404": {
				description: "Team not found",
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

			// Check if user is a member of this team and get team details
			const team: TeamWithDetails | null = await prisma.team.findFirst({
				where: {
					id,
					members: {
						some: {
							userId: user.id,
						},
					},
				},
				include: {
					members: {
						include: {
							user: {
								select: {
									username: true,
									email: true,
								},
							},
						},
						orderBy: {
							joinedAt: "asc",
						},
					},
					// biome-ignore lint/style/useNamingConvention: Prisma generated field
					_count: {
						select: {
							rules: true,
						},
					},
				},
			});

			if (!team) {
				return c.json({ error: "Not a member of this team" }, 403 as const);
			}

			// Get user's role in the team
			const userMember = team.members.find((member) => member.userId === user.id);
			const userRole = userMember?.role || "member";

			// Format members
			const members = team.members.map((member) => ({
				userId: member.userId,
				username: member.user.username,
				email: member.user.email,
				role: member.role,
				joinedAt: member.joinedAt,
			}));

			return c.json({
				id: team.id,
				name: team.name,
				displayName: team.displayName,
				description: team.description,
				ownerId: team.ownerId,
				createdAt: team.createdAt,
				updatedAt: team.updatedAt,
				role: userRole,
				members,
				ruleCount: team._count.rules,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
