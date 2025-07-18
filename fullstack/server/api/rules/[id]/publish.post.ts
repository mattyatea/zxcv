import { z } from "zod";
import { requireAuth } from "~/server/utils/auth";
import { generateId } from "~/server/utils/crypto";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";

const paramsSchema = z.object({
	id: z.string(),
});

const bodySchema = z.object({
	version: z.string().regex(/^\d+\.\d+\.\d+$/),
	changelog: z.string().optional(),
	content: z.string().min(1),
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
	const { version, changelog, content } = body;

	const prisma = createPrismaClient(event.context.cloudflare.env.DB);

	try {
		// Get the rule first
		const rule = await prisma.rule.findUnique({
			where: { id },
			include: { versions: true },
		});

		if (!rule) {
			throw createError({
				statusCode: 404,
				statusMessage: "Rule not found",
			});
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
					throw createError({
						statusCode: 403,
						statusMessage: "Forbidden",
					});
				}
			} else {
				throw createError({
					statusCode: 403,
					statusMessage: "Forbidden",
				});
			}
		}

		// Check if version already exists
		const existingVersion = rule.versions.find(
			(v: { versionNumber: string }) => v.versionNumber === version,
		);
		if (existingVersion) {
			throw createError({
				statusCode: 409,
				statusMessage: "Version already exists",
			});
		}

		// Generate version ID and calculate content hash
		const versionId = generateId();
		const encoder = new TextEncoder();
		const contentData = encoder.encode(content);
		const hashBuffer = await crypto.subtle.digest("SHA-256", contentData);
		const contentHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

		// Store content in R2
		const r2Key = `rules/${id}/versions/${versionId}.md`;
		await event.context.cloudflare.env.R2.put(r2Key, content, {
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

			return {
				id: updatedRule.id,
				version: updatedRule.version,
				latest_version_id: versionId,
				published_at: updatedRule.publishedAt || Math.floor(Date.now() / 1000),
			};
		} catch (error) {
			// Manual rollback: delete the version and R2 object if rule update fails
			await prisma.ruleVersion.delete({ where: { id: versionId } });
			await event.context.cloudflare.env.R2.delete(r2Key);
			throw error;
		}
	} catch (error) {
		const prismaError = handlePrismaError(error);
		throw createError({
			statusCode: prismaError.status,
			statusMessage: prismaError.message,
		});
	}
});