import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { canViewTeamRule } from "../../utils/teams";

export class GetSpecificVersionEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules", "Versions"],
		summary: "Get a specific version of a rule",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
				version: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Version retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							rule_id: z.string(),
							version_number: z.string(),
							changelog: z.string().optional(),
							content: z.string(),
							created_at: z.number(),
							created_by: z.object({
								id: z.string(),
								username: z.string(),
							}),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"404": {
				description: "Rule or version not found",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id, version } = data.params;

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

			// Get specific version with creator information
			const versionData = await prisma.ruleVersion.findFirst({
				where: {
					ruleId: id,
					versionNumber: version,
				},
				include: {
					creator: {
						select: {
							id: true,
							username: true,
						},
					},
				},
			});

			if (!versionData) {
				return c.json({ error: "Version not found" }, 404 as const);
			}

			// Get content from R2
			const object = await env.R2.get(versionData.r2ObjectKey);
			if (!object) {
				return c.json({ error: "Content not found" }, 404 as const);
			}

			const content = await object.text();

			return c.json({
				id: versionData.id,
				rule_id: versionData.ruleId,
				version: versionData.versionNumber,
				version_number: versionData.versionNumber,
				changelog: versionData.changelog || undefined,
				content,
				created_at: versionData.createdAt,
				created_by: {
					id: versionData.creator.id,
					username: versionData.creator.username,
				},
			});
		} catch (_error) {
			// console.error("Error fetching version:", error);
			return c.json({ error: "Failed to fetch version" }, 500 as const);
		}
	}
}
