import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { canViewTeamRule } from "../../utils/teams";

export class DiffVersionsEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules", "Versions"],
		summary: "Get diff between two versions of a rule",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
			query: z.object({
				from: z.string(),
				to: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Diff retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							from_version: z.string(),
							to_version: z.string(),
							from_content: z.string(),
							to_content: z.string(),
							changes: z.object({
								additions: z.number(),
								deletions: z.number(),
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
		const { id } = data.params;
		const { from, to } = data.query;

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

			// Get both versions
			const [fromVersion, toVersion] = await Promise.all([
				prisma.ruleVersion.findFirst({
					where: {
						ruleId: id,
						versionNumber: from,
					},
				}),
				prisma.ruleVersion.findFirst({
					where: {
						ruleId: id,
						versionNumber: to,
					},
				}),
			]);

			if (!fromVersion || !toVersion) {
				return c.json({ error: "Version not found" }, 404 as const);
			}

			// Get content from R2
			const [fromObject, toObject] = await Promise.all([
				env.R2.get(fromVersion.r2ObjectKey),
				env.R2.get(toVersion.r2ObjectKey),
			]);

			if (!fromObject || !toObject) {
				return c.json({ error: "Content not found" }, 404 as const);
			}

			const [fromContent, toContent] = await Promise.all([fromObject.text(), toObject.text()]);

			// Simple line-based diff calculation
			const fromLines = fromContent.split("\n");
			const toLines = toContent.split("\n");

			// Count additions and deletions (simple approach)
			const additions = toLines.length - fromLines.length;
			const deletions = Math.max(0, fromLines.length - toLines.length);

			return c.json({
				from: from,
				to: to,
				from_content: fromContent,
				to_content: toContent,
				diff: {
					additions: Math.max(0, additions),
					deletions: deletions,
				},
			});
		} catch (_error) {
			// console.error("Error creating diff:", error);
			return c.json({ error: "Failed to create diff" }, 500 as const);
		}
	}
}
