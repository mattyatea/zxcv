import { z } from "zod";
import { generateId } from "~/server/utils/crypto";
import { createPrismaClient } from "~/server/utils/prisma";
import { canViewTeamRule } from "~/server/utils/teams";

const paramsSchema = z.object({
	id: z.string(),
});

const querySchema = z.object({
	version: z.string().optional(),
	format: z.enum(["markdown", "text", "json"]).default("markdown"),
});

export default defineEventHandler(async (event) => {
	// Validate parameters and query
	const params = await getValidatedRouterParams(event, paramsSchema.parse);
	const query = await getValidatedQuery(event, querySchema.parse);
	const { id } = params;
	const { version, format } = query;

	const user = event.context.user;
	const prisma = createPrismaClient(event.context.cloudflare.env.DB);

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
			throw createError({
				statusCode: 404,
				statusMessage: "Rule not found",
			});
		}

		// Check access permissions
		if (rule.visibility === "private" && (!user || user.id !== rule.userId)) {
			throw createError({
				statusCode: 401,
				statusMessage: "Unauthorized",
			});
		}

		if (rule.visibility === "team") {
			if (!user || !rule.teamId) {
				throw createError({
					statusCode: 401,
					statusMessage: "Unauthorized",
				});
			}

			const canView = await canViewTeamRule(prisma, user.id, rule.teamId);
			if (!canView) {
				throw createError({
					statusCode: 401,
					statusMessage: "Unauthorized",
				});
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
			throw createError({
				statusCode: 404,
				statusMessage: "Version not found",
			});
		}

		// Get content from R2
		const object = await event.context.cloudflare.env.R2.get(versionData.r2ObjectKey);
		if (!object) {
			throw createError({
				statusCode: 404,
				statusMessage: "Content not found",
			});
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
						getHeader(event, "CF-Connecting-IP") || getHeader(event, "X-Forwarded-For") || "unknown",
					userAgent: getHeader(event, "User-Agent") || "unknown",
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
				setResponseHeaders(event, {
					"Content-Type": "text/plain; charset=utf-8",
					"Content-Disposition": `attachment; filename="${rule.name}-v${versionData.versionNumber}.txt"`,
				});
				return content;

			case "json":
				return {
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
				};
				
			default:
				setResponseHeaders(event, {
					"Content-Type": "text/markdown; charset=utf-8",
					"Content-Disposition": `attachment; filename="${rule.name}-v${versionData.versionNumber}.md"`,
				});
				return content;
		}
	} catch (error) {
		// console.error("Error downloading rule:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to download rule",
		});
	}
});