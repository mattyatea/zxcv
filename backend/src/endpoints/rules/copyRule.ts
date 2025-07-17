import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";
import { canViewTeamRule } from "../../utils/teams";

export class CopyRuleEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules"],
		summary: "Copy an existing rule",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z
								.string()
								.min(1)
								.max(100)
								.regex(/^[a-zA-Z0-9_-]+$/),
							org: z
								.string()
								.min(1)
								.max(50)
								.regex(/^[a-zA-Z0-9_-]+$/)
								.optional()
								.nullable(),
							visibility: z.enum(["public", "private", "team"]).default("private"),
							team_id: z.string().optional(),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Rule copied successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							name: z.string(),
							org: z.string().optional(),
							visibility: z.string(),
							version: z.string(),
							created_at: z.number(),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden",
			},
			"404": {
				description: "Rule not found",
			},
			"409": {
				description: "Rule already exists",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;
		const { name, org, visibility, team_id } = data.body;

		const env = c.env as Env;
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}
		const prisma = createPrismaClient(env.DB);

		try {
			// Get source rule
			const sourceRule = await prisma.rule.findUnique({
				where: { id },
			});

			if (!sourceRule) {
				return c.json({ error: "Rule not found" }, 404 as const);
			}

			// Check access permissions for source rule
			if (sourceRule.visibility === "private" && sourceRule.userId !== user.id) {
				return c.json({ error: "Forbidden" }, 403 as const);
			}

			if (sourceRule.visibility === "team") {
				if (!sourceRule.teamId) {
					return c.json({ error: "Forbidden" }, 403 as const);
				}

				const canView = await canViewTeamRule(prisma, user.id, sourceRule.teamId);
				if (!canView) {
					return c.json({ error: "Forbidden" }, 403 as const);
				}
			}

			// Check if new rule name already exists
			const existing = await prisma.rule.findFirst({
				where: {
					name,
					org: org || null,
				},
			});

			if (existing) {
				return c.json({ error: "Rule already exists" }, 409 as const);
			}

			// Get latest version content
			if (!sourceRule.latestVersionId) {
				return c.json({ error: "No version found for source rule" }, 404 as const);
			}

			const latestVersion = await prisma.ruleVersion.findUnique({
				where: { id: sourceRule.latestVersionId },
			});

			if (!latestVersion) {
				return c.json({ error: "Version not found" }, 404 as const);
			}

			// Get content from R2
			const object = await env.R2.get(latestVersion.r2ObjectKey);
			if (!object) {
				return c.json({ error: "Content not found" }, 404 as const);
			}

			const content = await object.text();

			// Generate new IDs
			const ruleId = generateId();
			const versionId = generateId();
			const now = Math.floor(Date.now() / 1000);

			// Check if user has permission to create team rule
			if (visibility === "team" && team_id) {
				const teamMember = await prisma.teamMember.findFirst({
					where: {
						teamId: team_id,
						userId: user.id,
					},
				});

				if (!teamMember) {
					return c.json({ error: "Not a member of the team" }, 403 as const);
				}
			}

			// Store content in R2
			const r2Key = `rules/${ruleId}/versions/${versionId}.md`;
			await env.R2.put(r2Key, content, {
				customMetadata: {
					ruleId,
					versionId,
					userId: user.id,
					createdAt: now.toString(),
					copiedFrom: sourceRule.id,
				},
			});

			// Create new rule and version sequentially (D1 doesn't support transactions)
			const newRule = await prisma.rule.create({
				data: {
					id: ruleId,
					name,
					org: org || null,
					userId: user.id,
					visibility,
					description: sourceRule.description,
					tags: sourceRule.tags,
					createdAt: now,
					updatedAt: now,
					version: "1.0.0",
					latestVersionId: versionId,
					teamId: team_id || null,
				},
			});

			try {
				// Create version
				await prisma.ruleVersion.create({
					data: {
						id: versionId,
						ruleId,
						versionNumber: "1.0.0",
						changelog: `Copied from ${sourceRule.name}`,
						contentHash: latestVersion.contentHash,
						r2ObjectKey: r2Key,
						createdAt: now,
						createdBy: user.id,
					},
				});
			} catch (error) {
				// Manual rollback: delete the rule and R2 object if version creation fails
				await prisma.rule.delete({ where: { id: ruleId } });
				await env.R2.delete(r2Key);
				throw error;
			}

			const result = newRule;

			return c.json(
				{
					id: result.id,
					name: result.name,
					org: result.org || undefined,
					visibility: result.visibility,
					version: result.version,
					created_at: result.createdAt,
					ownerId: result.userId,
				},
				201 as const,
			);
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
