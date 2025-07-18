import { z } from "zod";
import { requireAuth } from "~/server/utils/auth";
import { generateId } from "~/server/utils/crypto";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";

const paramsSchema = z.object({
	id: z.string(),
});

const bodySchema = z.object({
	star: z.boolean(),
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
	const { star } = body;

	const prisma = createPrismaClient(event.context.cloudflare.env.DB);

	try {
		// Check if rule exists and if user has access
		const rule = await prisma.rule.findUnique({
			where: { id },
			select: {
				id: true,
				stars: true,
				visibility: true,
				userId: true,
				teamId: true,
			},
		});

		if (!rule) {
			throw createError({
				statusCode: 404,
				statusMessage: "Rule not found",
			});
		}

		// Check if user has access to this rule
		if (rule.visibility === "private" && rule.userId !== user.id) {
			throw createError({
				statusCode: 403,
				statusMessage: "Forbidden",
			});
		}

		if (rule.visibility === "team" && rule.teamId) {
			// Check if user is member of the team
			const teamMember = await prisma.teamMember.findFirst({
				where: {
					teamId: rule.teamId,
					userId: user.id,
				},
			});

			if (!teamMember) {
				throw createError({
					statusCode: 403,
					statusMessage: "Forbidden",
				});
			}
		}

		// Check current star status
		const existingStar = await prisma.ruleStar.findUnique({
			where: {
				// biome-ignore lint/style/useNamingConvention: Prisma generated composite key
				ruleId_userId: {
					ruleId: id,
					userId: user.id,
				},
			},
		});

		const isCurrentlyStarred = !!existingStar;

		if (star === isCurrentlyStarred) {
			// No change needed
			return {
				starred: star,
				stars: rule.stars,
				message: star ? "Rule already starred" : "Rule not starred",
			};
		}

		// Execute star operation without transaction
		let result: { stars: number };
		if (star) {
			// Add star
			await prisma.ruleStar.create({
				data: {
					id: generateId(),
					ruleId: id,
					userId: user.id,
					createdAt: Math.floor(Date.now() / 1000),
				},
			});

			result = await prisma.rule.update({
				where: { id },
				data: {
					stars: {
						increment: 1,
					},
				},
				select: { stars: true },
			});
		} else {
			// Remove star
			await prisma.ruleStar.delete({
				where: {
					// biome-ignore lint/style/useNamingConvention: Prisma generated composite key
					ruleId_userId: {
						ruleId: id,
						userId: user.id,
					},
				},
			});

			result = await prisma.rule.update({
				where: { id },
				data: {
					stars: {
						decrement: 1,
					},
				},
				select: { stars: true },
			});

			// Ensure stars don't go below 0
			if (result.stars < 0) {
				result = await prisma.rule.update({
					where: { id },
					data: { stars: 0 },
					select: { stars: true },
				});
			}
		}

		return {
			starred: star,
			stars: result.stars,
		};
	} catch (error) {
		const prismaError = handlePrismaError(error);
		throw createError({
			statusCode: prismaError.status,
			statusMessage: prismaError.message,
		});
	}
});