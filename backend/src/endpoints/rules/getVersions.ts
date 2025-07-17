import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { canViewTeamRule } from "../../utils/teams";

export class GetVersionsEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules", "Versions"],
		summary: "Get version history of a rule",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Version history retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							versions: z.array(
								z.object({
									id: z.string(),
									version_number: z.string(),
									changelog: z.string().optional(),
									created_at: z.number(),
									created_by: z.object({
										id: z.string(),
										username: z.string(),
									}),
								}),
							),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"404": {
				description: "Rule not found",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;

		const env = c.env as Env;
		const user = c.get("user");
		const prisma = createPrismaClient(env.DB);

		try {
			// Find rule and check permissions
			const rule = await prisma.rule.findUnique({
				where: { id },
			});

			if (!rule) {
				return c.json({ error: "Rule not found" }, 404 as const);
			}

			// Check access permissions
			if (rule.visibility === "private" && (!user || user.id !== rule.userId)) {
				return c.json({ error: "Unauthorized" }, 401 as const);
			}

			if (rule.visibility === "team") {
				if (!user || !rule.teamId) {
					return c.json({ error: "Unauthorized" }, 401 as const);
				}

				const canView = await canViewTeamRule(prisma, user.id, rule.teamId);
				if (!canView) {
					return c.json({ error: "Unauthorized" }, 401 as const);
				}
			}

			// Get all versions with creator information
			const versions = await prisma.ruleVersion.findMany({
				where: {
					ruleId: id,
				},
				include: {
					creator: {
						select: {
							id: true,
							username: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return c.json({
				versions: versions.map((v) => ({
					id: v.id,
					version_number: v.versionNumber,
					changelog: v.changelog || undefined,
					created_at: v.createdAt,
					created_by: {
						id: v.creator.id,
						username: v.creator.username,
					},
				})),
			});
		} catch (_error) {
			// console.error("Error fetching versions:", error);
			return c.json({ error: "Failed to fetch versions" }, 500 as const);
		}
	}
}
