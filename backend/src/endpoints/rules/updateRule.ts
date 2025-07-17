import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";
import { canEditTeamRule } from "../../utils/teams";

export class UpdateRuleEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules"],
		summary: "Update an existing rule",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							description: z.string().max(500).optional(),
							tags: z.array(z.string()).optional(),
							content: z.string().optional(),
							version: z
								.string()
								.regex(/^\d+\.\d+\.\d+$/)
								.optional(),
							changelog: z.string().optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Rule updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							version: z.string(),
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
		await requireAuth(c, async () => {
			// Authentication verified by middleware
		});

		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;
		const { description, tags, content, version, changelog } = data.body;

		const env = c.env as Env;
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}
		const prisma = createPrismaClient(env.DB);

		try {
			// Find rule and check ownership
			const rule = await prisma.rule.findUnique({
				where: { id },
			});

			if (!rule) {
				return c.json({ error: "Rule not found" }, 404 as const);
			}

			// Check permissions based on ownership or team membership
			if (rule.userId !== user.id) {
				// If not the owner, check if they have team edit permissions
				if (rule.teamId && rule.visibility === "team") {
					const canEdit = await canEditTeamRule(prisma, user.id, rule.teamId);
					if (!canEdit) {
						return c.json({ error: "Unauthorized" }, 401 as const);
					}
				} else {
					return c.json({ error: "Unauthorized" }, 401 as const);
				}
			}

			const now = Math.floor(Date.now() / 1000);

			// Prepare update data
			const updateData: Record<string, string | number | null> = {
				updatedAt: now,
			};

			// Update metadata
			if (description !== undefined) {
				updateData.description = description || null;
			}

			if (tags !== undefined) {
				updateData.tags = JSON.stringify(tags);
			}

			// Prepare batch operations
			const operations = [];

			// Create new version if content changed
			let newVersion = rule.version;
			if (content) {
				const versionId = generateId();
				newVersion = version || incrementVersion(rule.version);

				// Calculate content hash
				const encoder = new TextEncoder();
				const contentData = encoder.encode(content);
				const hashBuffer = await crypto.subtle.digest("SHA-256", contentData);
				const contentHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

				// Store content in R2
				const r2Key = `rules/${rule.id}/versions/${versionId}.md`;
				await env.R2.put(r2Key, content, {
					customMetadata: {
						ruleId: rule.id,
						versionId,
						userId: user.id,
						createdAt: now.toString(),
					},
				});

				// Add new version creation to operations
				operations.push(
					prisma.ruleVersion.create({
						data: {
							id: versionId,
							ruleId: rule.id,
							versionNumber: newVersion,
							changelog: changelog || `Updated to version ${newVersion}`,
							contentHash,
							r2ObjectKey: r2Key,
							createdAt: now,
							createdBy: user.id,
						},
					}),
				);

				updateData.version = newVersion;
				updateData.latestVersionId = versionId;
			}

			// Add rule update to operations
			operations.push(
				prisma.rule.update({
					where: { id },
					data: updateData,
				}),
			);

			// Execute operations sequentially (D1 doesn't support transactions)
			// First, create new version if needed
			if (operations.length > 1) {
				try {
					// Create new version first
					await operations[0];
				} catch (error) {
					// If version creation fails, we need to clean up the R2 object
					if (content) {
						const r2Key = `rules/${rule.id}/versions/${generateId()}.md`;
						await env.R2.delete(r2Key);
					}
					throw error;
				}
			}

			// Then update the rule
			const updatedRule = await prisma.rule.update({
				where: { id },
				data: updateData,
			});

			return c.json({
				id: updatedRule.id,
				version: updatedRule.version,
				description: updatedRule.description,
				tags: updatedRule.tags ? JSON.parse(updatedRule.tags) : undefined,
				updated_at: updatedRule.updatedAt,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}

function incrementVersion(version: string): string {
	const parts = version.split(".").map(Number);
	parts[2]++; // Increment patch version
	return parts.join(".");
}
