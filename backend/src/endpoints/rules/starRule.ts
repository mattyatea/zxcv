import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class StarRuleEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules"],
		summary: "Star or unstar a rule",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							star: z.boolean(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Star status updated",
				content: {
					"application/json": {
						schema: z.object({
							starred: z.boolean(),
							stars: z.number(),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden",
			},
			"404": {
				description: "Rule not found",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;
		const { star } = data.body;

		const env = c.env as Env;
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}
		const prisma = createPrismaClient(env.DB);

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
				return c.json({ error: "Rule not found" }, 404 as const);
			}

			// Check if user has access to this rule
			if (rule.visibility === "private" && rule.userId !== user.id) {
				return c.json({ error: "Forbidden" }, 403 as const);
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
					return c.json({ error: "Forbidden" }, 403 as const);
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
				return c.json({
					starred: star,
					stars: rule.stars,
					message: star ? "Rule already starred" : "Rule not starred",
				});
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

			return c.json({
				starred: star,
				stars: result.stars,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
