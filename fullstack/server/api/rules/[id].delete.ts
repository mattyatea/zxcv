import { z } from "zod";
import { requireAuth } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { canDeleteTeamRule } from "~/server/utils/teams";

const paramsSchema = z.object({
	id: z.string(),
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

	// Validate parameters
	const params = await getValidatedRouterParams(event, paramsSchema.parse);
	const { id } = params;

	const prisma = createPrismaClient(event.context.cloudflare.env.DB);

	try {
		// Find rule and check ownership
		const rule = await prisma.rule.findUnique({
			where: { id },
			include: {
				versions: {
					select: {
						r2ObjectKey: true,
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

		// Check permissions based on ownership or team membership
		if (rule.userId !== user.id) {
			// If not the owner, check if they have team delete permissions
			if (rule.teamId && rule.visibility === "team") {
				const canDelete = await canDeleteTeamRule(prisma, user.id, rule.teamId);
				if (!canDelete) {
					throw createError({
						statusCode: 403,
						statusMessage: "Unauthorized",
					});
				}
			} else {
				throw createError({
					statusCode: 403,
					statusMessage: "Unauthorized",
				});
			}
		}

		// Delete from R2
		const deletePromises = rule.versions.map((version: { r2ObjectKey: string }) =>
			event.context.cloudflare.env.R2.delete(version.r2ObjectKey),
		);
		await Promise.all(deletePromises);

		// Delete from database (cascade will handle versions)
		await prisma.rule.delete({
			where: { id },
		});

		// Return 204 No Content
		setResponseStatus(event, 204);
		return null;
	} catch (error) {
		const prismaError = handlePrismaError(error);
		throw createError({
			statusCode: prismaError.status,
			statusMessage: prismaError.message,
		});
	}
});