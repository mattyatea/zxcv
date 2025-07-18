import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { canViewTeamRule } from "~/server/utils/teams";

const paramsSchema = z.object({
	id: z.string(),
	version: z.string(),
});

export default defineEventHandler(async (event) => {
	// Validate parameters
	const params = await getValidatedRouterParams(event, paramsSchema.parse);
	const { id, version } = params;

	const user = event.context.user;
	const prisma = createPrismaClient(event.context.cloudflare.env.DB);

	try {
		// Find rule and check permissions
		const rule = await prisma.rule.findUnique({
			where: { id },
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

		// Get specific version with creator information
		const versionData = await prisma.ruleVersion.findFirst({
			where: {
				ruleId: id,
				versionNumber: version,
			},
			include: {
				creator: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});

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

		return {
			id: versionData.id,
			rule_id: versionData.ruleId,
			version: versionData.versionNumber,
			version_number: versionData.versionNumber,
			changelog: versionData.changelog || undefined,
			content,
			created_at: versionData.createdAt,
			created_by: {
				id: versionData.creator.id,
				username: versionData.creator.username,
			},
		};
	} catch (error) {
		// console.error("Error fetching version:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to fetch version",
		});
	}
});