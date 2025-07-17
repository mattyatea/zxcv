import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class PublishRuleEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules"],
		summary: "Publish a new version of a rule",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							version: z.string().regex(/^\d+\.\d+\.\d+$/),
							changelog: z.string().optional(),
							content: z.string().min(1),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Rule published successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							version: z.string(),
							published_at: z.number(),
						}),
					},
				},
			},
			"403": {
				description: "Forbidden",
			},
			"404": {
				description: "Rule not found",
			},
		},
	};

	async handle(c: AppContext) {
		await requireAuth(c, async () => {
			// Authentication verified by middleware
		});

		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;
		const { version, changelog, content } = data.body;

		const env = c.env as Env;
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}
		const prisma = createPrismaClient(env.DB);

		try {
			// Get the rule first
			const rule = await prisma.rule.findUnique({
				where: { id },
				include: { versions: true },
			});

			if (!rule) {
				return c.json({ error: "Rule not found" }, 404 as const);
			}

			// Check ownership or team membership with edit permission
			if (rule.userId !== user.id) {
				// Check if it's a team rule and user has edit permission
				if (rule.visibility === "team" && rule.teamId) {
					const teamMember = await prisma.teamMember.findFirst({
						where: {
							teamId: rule.teamId,
							userId: user.id,
							role: { in: ["owner", "admin", "member"] }, // all roles can publish for now
						},
					});

					if (!teamMember) {
						return c.json({ error: "Forbidden" }, 403 as const);
					}
				} else {
					return c.json({ error: "Forbidden" }, 403 as const);
				}
			}

			// Check if version already exists
			const existingVersion = rule.versions.find((v) => v.versionNumber === version);
			if (existingVersion) {
				return c.json({ error: "Version already exists" }, 409 as const);
			}

			// Generate version ID and calculate content hash
			const versionId = generateId();
			const encoder = new TextEncoder();
			const contentData = encoder.encode(content);
			const hashBuffer = await crypto.subtle.digest("SHA-256", contentData);
			const contentHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

			// Store content in R2
			const r2Key = `rules/${id}/versions/${versionId}.md`;
			await env.R2.put(r2Key, content, {
				customMetadata: {
					ruleId: id,
					versionId,
					userId: user.id,
					createdAt: Math.floor(Date.now() / 1000).toString(),
				},
			});

			const now = Math.floor(Date.now() / 1000);

			// Execute operations sequentially (D1 doesn't support transactions)
			// Create new version first
			const _newVersion = await prisma.ruleVersion.create({
				data: {
					id: versionId,
					ruleId: id,
					versionNumber: version,
					changelog: changelog || null,
					contentHash,
					r2ObjectKey: r2Key,
					createdAt: now,
					createdBy: user.id,
				},
			});

			try {
				// Update rule with new version and publish time
				const updatedRule = await prisma.rule.update({
					where: { id },
					data: {
						version,
						latestVersionId: versionId,
						publishedAt: now,
						updatedAt: now,
					},
				});

				return c.json({
					id: updatedRule.id,
					version: updatedRule.version,
					latest_version_id: versionId,
					published_at: updatedRule.publishedAt || Math.floor(Date.now() / 1000),
				});
			} catch (error) {
				// Manual rollback: delete the version and R2 object if rule update fails
				await prisma.ruleVersion.delete({ where: { id: versionId } });
				await env.R2.delete(r2Key);
				throw error;
			}
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
