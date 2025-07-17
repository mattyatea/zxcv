import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { canViewTeamRule } from "../../utils/teams";

export class DownloadRuleEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules"],
		summary: "Download a rule content",
		security: [],
		request: {
			params: z.object({
				id: z.string(),
			}),
			query: z.object({
				version: z.string().optional(),
				format: z.enum(["markdown", "text", "json"]).default("markdown"),
			}),
		},
		responses: {
			"200": {
				description: "Rule content",
				content: {
					"text/markdown": {
						schema: z.string(),
					},
					"text/plain": {
						schema: z.string(),
					},
					"application/json": {
						schema: z.object({
							id: z.string(),
							name: z.string(),
							version: z.string(),
							content: z.string(),
							metadata: z.object({
								org: z.string().optional(),
								description: z.string().optional(),
								tags: z.array(z.string()).optional(),
								author: z.string(),
								created_at: z.number(),
								updated_at: z.number(),
							}),
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
		const { version, format } = data.query;

		const env = c.env as Env;
		const user = c.get("user");
		const prisma = createPrismaClient(env.DB);

		try {
			// Get rule with author info
			const rule = await prisma.rule.findUnique({
				where: { id },
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
						ruleId: id,
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

			// Track download sequentially (D1 doesn't support transactions)
			try {
				// Create download record first
				await prisma.ruleDownload.create({
					data: {
						id: generateId(),
						ruleId: id,
						userId: user?.id || null,
						ipAddress:
							c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown",
						userAgent: c.req.header("User-Agent") || "unknown",
						createdAt: Math.floor(Date.now() / 1000),
					},
				});

				// Update download count
				await prisma.rule.update({
					where: { id },
					data: {
						downloads: {
							increment: 1,
						},
					},
				});
			} catch (_error) {
				// Ignore error if download count update fails
			}

			// Return in requested format
			switch (format) {
				case "text":
					return new Response(content, {
						headers: {
							"Content-Type": "text/plain; charset=utf-8",
							"Content-Disposition": `attachment; filename="${rule.name}-v${versionData.versionNumber}.txt"`,
						},
					});

				case "json":
					return c.json({
						id: rule.id,
						name: rule.name,
						version: versionData.versionNumber,
						content,
						metadata: {
							org: rule.org || undefined,
							description: rule.description || undefined,
							tags: rule.tags ? JSON.parse(rule.tags) : undefined,
							author: rule.user.username,
							created_at: rule.createdAt,
							updated_at: rule.updatedAt,
						},
					});
				default:
					return new Response(content, {
						headers: {
							"Content-Type": "text/markdown; charset=utf-8",
							"Content-Disposition": `attachment; filename="${rule.name}-v${versionData.versionNumber}.md"`,
						},
					});
			}
		} catch (_error) {
			// console.error("Error downloading rule:", error);
			return c.json({ error: "Failed to download rule" }, 500 as const);
		}
	}
}
