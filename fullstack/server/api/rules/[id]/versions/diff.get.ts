import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { canViewTeamRule } from "~/server/utils/teams";

const paramsSchema = z.object({
	id: z.string(),
});

const querySchema = z.object({
	from: z.string(),
	to: z.string(),
});

export default defineEventHandler(async (event) => {
	// Validate parameters and query
	const params = await getValidatedRouterParams(event, paramsSchema.parse);
	const query = await getValidatedQuery(event, querySchema.parse);
	const { id } = params;
	const { from, to } = query;

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

		// Get both versions
		const [fromVersion, toVersion] = await Promise.all([
			prisma.ruleVersion.findFirst({
				where: {
					ruleId: id,
					versionNumber: from,
				},
			}),
			prisma.ruleVersion.findFirst({
				where: {
					ruleId: id,
					versionNumber: to,
				},
			}),
		]);

		if (!fromVersion || !toVersion) {
			throw createError({
				statusCode: 404,
				statusMessage: "Version not found",
			});
		}

		// Get content from R2
		const [fromObject, toObject] = await Promise.all([
			event.context.cloudflare.env.R2.get(fromVersion.r2ObjectKey),
			event.context.cloudflare.env.R2.get(toVersion.r2ObjectKey),
		]);

		if (!fromObject || !toObject) {
			throw createError({
				statusCode: 404,
				statusMessage: "Content not found",
			});
		}

		const [fromContent, toContent] = await Promise.all([fromObject.text(), toObject.text()]);

		// Simple line-based diff calculation
		const fromLines = fromContent.split("\n");
		const toLines = toContent.split("\n");

		// Count additions and deletions (simple approach)
		const additions = toLines.length - fromLines.length;
		const deletions = Math.max(0, fromLines.length - toLines.length);

		return {
			from: from,
			to: to,
			from_content: fromContent,
			to_content: toContent,
			diff: {
				additions: Math.max(0, additions),
				deletions: deletions,
			},
		};
	} catch (error) {
		// console.error("Error creating diff:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create diff",
		});
	}
});