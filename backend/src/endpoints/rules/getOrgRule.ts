import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { canViewTeamRule } from "../../utils/teams";

export class GetOrgRuleEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules"],
		summary: "Get a rule by organization and name",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				org: z.string(),
				rulename: z.string(),
			}),
			query: z.object({
				version: z.string().optional(),
			}),
		},
		responses: {
			"200": {
				description: "Rule retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							name: z.string(),
							organization: z.string(),
							visibility: z.string(),
							description: z.string().optional(),
							tags: z.array(z.string()).optional(),
							version: z.string(),
							content: z.string(),
							author: z.object({
								id: z.string(),
								username: z.string(),
							}),
							created_at: z.number(),
							updated_at: z.number(),
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
		const { org, rulename } = data.params;
		const { version } = data.query;

		const env = c.env as Env;
		const user = c.get("user");
		const prisma = createPrismaClient(env.DB);

		try {
			// Find rule with author information
			const rule = await prisma.rule.findFirst({
				where: {
					name: rulename,
					org: org,
				},
				include: {
					user: {
						select: {
							id: true,
							username: true,
						},
					},
				},
			});

			if (!rule) {
				return c.json({ error: "Rule not found" }, 404 as const);
			}

			// Check access permissions
			if (rule.visibility === "private" && (!user || user.id !== rule.userId)) {
				return c.json({ error: "Unauthorized" }, 401 as const);
			}

			if (rule.visibility === "team") {
				// Check team membership
				if (!user || !rule.teamId) {
					return c.json({ error: "Unauthorized" }, 401 as const);
				}

				const canView = await canViewTeamRule(prisma, user.id, rule.teamId);
				if (!canView) {
					return c.json({ error: "Unauthorized" }, 401 as const);
				}
			}

			// Get specific version or latest
			let versionData: { id: string; versionNumber: string; r2ObjectKey: string } | null = null;
			if (version) {
				versionData = await prisma.ruleVersion.findFirst({
					where: {
						ruleId: rule.id,
						versionNumber: version,
					},
				});
			} else if (rule.latestVersionId) {
				versionData = await prisma.ruleVersion.findUnique({
					where: {
						id: rule.latestVersionId,
					},
				});
			}

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
				id: rule.id,
				name: rule.name,
				organization: rule.org || "",
				visibility: rule.visibility,
				description: rule.description || undefined,
				tags: rule.tags ? JSON.parse(rule.tags) : undefined,
				version: versionData.versionNumber,
				content,
				author: {
					id: rule.user.id,
					username: rule.user.username,
				},
				created_at: rule.createdAt,
				updated_at: rule.updatedAt,
			});
		} catch (_error) {
			// console.error("Error fetching rule:", error);
			return c.json({ error: "Failed to fetch rule" }, 500 as const);
		}
	}
}
