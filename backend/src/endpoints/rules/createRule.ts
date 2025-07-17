import { ApiException, OpenAPIRoute } from "chanfana";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class CreateRuleEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules"],
		summary: "Create a new rule",
		security: [{ bearerAuth: [] }],
		request: {
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
								.optional(),
							visibility: z.enum(["public", "private", "team"]).default("private"),
							description: z.string().max(500).optional(),
							tags: z.array(z.string()).optional(),
							content: z.string().min(1),
							teamId: z.string().optional(),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Rule created successfully",
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
			"409": {
				description: "Rule already exists",
			},
		},
	};

	async handle(c: AppContext) {
		// Check authentication first
		const user = c.get("user");
		if (!user) {
			throw new ApiException("Authentication required");
		}

		// Check scope for API key authentication
		const apiKeyScopes = c.get("apiKeyScopes");
		if (apiKeyScopes && !apiKeyScopes.includes("rules:write")) {
			return c.json({ error: "Insufficient scope" }, 403);
		}

		try {
			const data = await this.getValidatedData<typeof this.schema>();
			const { name, org, visibility, description, tags, content, teamId } = data.body;

			const env = c.env as Env;
			const prisma = createPrismaClient(env.DB);
			// Check if rule already exists
			const existing = await prisma.rule.findFirst({
				where: {
					name,
					org: org || null,
				},
			});

			if (existing) {
				return c.json({ error: "Rule already exists" }, 409 as const);
			}

			// Generate IDs
			const ruleId = generateId();
			const versionId = generateId();
			const now = Math.floor(Date.now() / 1000);

			// Calculate content hash
			const encoder = new TextEncoder();
			const contentData = encoder.encode(content);
			const hashBuffer = await crypto.subtle.digest("SHA-256", contentData);
			const contentHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

			// Store content in R2
			const r2Key = `rules/${ruleId}/versions/${versionId}.md`;
			await env.R2.put(r2Key, content, {
				customMetadata: {
					ruleId,
					versionId,
					userId: user.id,
					createdAt: now.toString(),
				},
			});

			// Check team membership if creating team rule
			if (visibility === "team" && teamId) {
				const teamMember = await prisma.teamMember.findFirst({
					where: {
						teamId,
						userId: user.id,
					},
				});

				if (!teamMember) {
					return c.json({ error: "Not a member of the team" }, 403 as const);
				}
			}

			// Create rule and version sequentially (D1 doesn't support transactions)
			const rule = await prisma.rule.create({
				data: {
					id: ruleId,
					name,
					org: org || null,
					userId: user.id,
					visibility,
					description: description || null,
					tags: tags ? JSON.stringify(tags) : null,
					createdAt: now,
					updatedAt: now,
					version: "1.0.0",
					latestVersionId: versionId,
					teamId: visibility === "team" ? teamId : null,
				},
			});

			try {
				// Create initial version
				await prisma.ruleVersion.create({
					data: {
						id: versionId,
						ruleId,
						versionNumber: "1.0.0",
						changelog: "Initial version",
						contentHash,
						r2ObjectKey: r2Key,
						createdAt: now,
						createdBy: user.id,
					},
				});
			} catch (error) {
				// Manual rollback: delete the rule if version creation fails
				await prisma.rule.delete({ where: { id: ruleId } });
				throw error;
			}

			const result = rule;

			return c.json(
				{
					id: result.id,
					name: result.name,
					org: result.org,
					visibility: result.visibility,
					version: result.version,
					created_at: result.createdAt,
				},
				201 as const,
			);
		} catch (error) {
			// Check if it's an ApiException
			if (error instanceof ApiException) {
				return c.json({ error: error.message }, error.status as ContentfulStatusCode);
			}
			// Don't log validation errors (ZodError) as they are expected
			if (error && typeof error === "object" && "issues" in error) {
				// This is a ZodError, handle it gracefully
				return c.json({ error: "Validation failed" }, 400 as const);
			}
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
