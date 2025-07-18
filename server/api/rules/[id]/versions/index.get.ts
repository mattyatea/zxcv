import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { canViewTeamRule } from "~/server/utils/teams";

const paramsSchema = z.object({
	id: z.string(),
});

export default defineEventHandler(async (event) => {
	// Validate parameters
	const params = await getValidatedRouterParams(event, paramsSchema.parse);
	const { id } = params;

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

		// Get all versions with creator information
		const versions = await prisma.ruleVersion.findMany({
			where: {
				ruleId: id,
			},
			include: {
				creator: {
					select: {
						id: true,
						username: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return {
			versions: versions.map((v: any) => ({
				id: v.id,
				version_number: v.versionNumber,
				changelog: v.changelog || undefined,
				created_at: v.createdAt,
				created_by: {
					id: v.creator.id,
					username: v.creator.username,
				},
			})),
		};
	} catch (error) {
		// console.error("Error fetching versions:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to fetch versions",
		});
	}
});