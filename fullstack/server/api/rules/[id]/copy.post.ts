import { z } from "zod";
import { requireAuth } from "~/server/utils/auth";
import { generateId } from "~/server/utils/crypto";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { canViewTeamRule } from "~/server/utils/teams";

const paramsSchema = z.object({
	id: z.string(),
});

const bodySchema = z.object({
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
});

export default defineEventHandler(async (event) => {
	// Require authentication
	const user = await requireAuth(event);
	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: "Authentication required",
		});
	}

	// Validate parameters and body
	const params = await getValidatedRouterParams(event, paramsSchema.parse);
	const body = await readValidatedBody(event, bodySchema.parse);
	const { id } = params;
	const { name, org, visibility, team_id } = body;

	const prisma = createPrismaClient(event.context.cloudflare.env.DB);

	try {
		// Get source rule
		const sourceRule = await prisma.rule.findUnique({
			where: { id },
		});

		if (!sourceRule) {
			throw createError({
				statusCode: 404,
				statusMessage: "Rule not found",
			});
		}

		// Check access permissions for source rule
		if (sourceRule.visibility === "private" && sourceRule.userId !== user.id) {
			throw createError({
				statusCode: 403,
				statusMessage: "Forbidden",
			});
		}

		if (sourceRule.visibility === "team") {
			if (!sourceRule.teamId) {
				throw createError({
					statusCode: 403,
					statusMessage: "Forbidden",
				});
			}

			const canView = await canViewTeamRule(prisma, user.id, sourceRule.teamId);
			if (!canView) {
				throw createError({
					statusCode: 403,
					statusMessage: "Forbidden",
				});
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
			throw createError({
				statusCode: 409,
				statusMessage: "Rule already exists",
			});
		}

		// Get latest version content
		if (!sourceRule.latestVersionId) {
			throw createError({
				statusCode: 404,
				statusMessage: "No version found for source rule",
			});
		}

		const latestVersion = await prisma.ruleVersion.findUnique({
			where: { id: sourceRule.latestVersionId },
		});

		if (!latestVersion) {
			throw createError({
				statusCode: 404,
				statusMessage: "Version not found",
			});
		}

		// Get content from R2
		const object = await event.context.cloudflare.env.R2.get(latestVersion.r2ObjectKey);
		if (!object) {
			throw createError({
				statusCode: 404,
				statusMessage: "Content not found",
			});
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
				throw createError({
					statusCode: 403,
					statusMessage: "Not a member of the team",
				});
			}
		}

		// Store content in R2
		const r2Key = `rules/${ruleId}/versions/${versionId}.md`;
		await event.context.cloudflare.env.R2.put(r2Key, content, {
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
			await event.context.cloudflare.env.R2.delete(r2Key);
			throw error;
		}

		setResponseStatus(event, 201);
		return {
			id: newRule.id,
			name: newRule.name,
			org: newRule.org || undefined,
			visibility: newRule.visibility,
			version: newRule.version,
			created_at: newRule.createdAt,
			ownerId: newRule.userId,
		};
	} catch (error) {
		const prismaError = handlePrismaError(error);
		throw createError({
			statusCode: prismaError.status,
			statusMessage: prismaError.message,
		});
	}
});