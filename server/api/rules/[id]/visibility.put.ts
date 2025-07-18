import { z } from "zod";
import { requireAuth } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";

const paramsSchema = z.object({
	id: z.string(),
});

const bodySchema = z.object({
	visibility: z.enum(["public", "private", "team"]),
	teamId: z.string().optional(),
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
	const { visibility, teamId } = body;

	const prisma = createPrismaClient(event.context.cloudflare.env.DB);

	try {
		// Find rule and check ownership
		const rule = await prisma.rule.findUnique({
			where: { id },
		});

		if (!rule) {
			throw createError({
				statusCode: 404,
				statusMessage: "Rule not found",
			});
		}

		// Only owner can change visibility
		if (rule.userId !== user.id) {
			throw createError({
				statusCode: 403,
				statusMessage: "Forbidden",
			});
		}

		// Validate team visibility
		if (visibility === "team") {
			if (!teamId) {
				throw createError({
					statusCode: 400,
					statusMessage: "Team ID is required for team visibility",
				});
			}

			// Check if user is a member of the team
			const teamMember = await prisma.teamMember.findFirst({
				where: {
					teamId,
					userId: user.id,
				},
			});

			if (!teamMember) {
				throw createError({
					statusCode: 400,
					statusMessage: "You must be a member of the team",
				});
			}
		}

		const now = Math.floor(Date.now() / 1000);

		// Update rule visibility
		const updatedRule = await prisma.rule.update({
			where: { id },
			data: {
				visibility,
				teamId: visibility === "team" ? teamId : null,
				updatedAt: now,
			},
		});

		return {
			id: updatedRule.id,
			visibility: updatedRule.visibility,
			teamId: updatedRule.teamId,
			updated_at: updatedRule.updatedAt,
		};
	} catch (error) {
		const prismaError = handlePrismaError(error);
		throw createError({
			statusCode: prismaError.status,
			statusMessage: prismaError.message,
		});
	}
});