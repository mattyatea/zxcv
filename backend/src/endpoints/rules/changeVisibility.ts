import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class ChangeVisibilityEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules"],
		summary: "Change rule visibility (public/private/team)",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							visibility: z.enum(["public", "private", "team"]),
							teamId: z.string().optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Visibility changed successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							visibility: z.string(),
							teamId: z.string().optional(),
							updated_at: z.number(),
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
			"400": {
				description: "Bad request",
			},
		},
	};

	async handle(c: AppContext) {
		await requireAuth(c, async () => {
			// Authentication verified by middleware
		});

		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;
		const { visibility, teamId } = data.body;

		const env = c.env as Env;
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}
		const prisma = createPrismaClient(env.DB);

		try {
			// Find rule and check ownership
			const rule = await prisma.rule.findUnique({
				where: { id },
			});

			if (!rule) {
				return c.json({ error: "Rule not found" }, 404 as const);
			}

			// Only owner can change visibility
			if (rule.userId !== user.id) {
				return c.json({ error: "Forbidden" }, 403 as const);
			}

			// Validate team visibility
			if (visibility === "team") {
				if (!teamId) {
					return c.json({ error: "Team ID is required for team visibility" }, 400 as const);
				}

				// Check if user is a member of the team
				const teamMember = await prisma.teamMember.findFirst({
					where: {
						teamId,
						userId: user.id,
					},
				});

				if (!teamMember) {
					return c.json({ error: "You must be a member of the team" }, 400 as const);
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

			return c.json({
				id: updatedRule.id,
				visibility: updatedRule.visibility,
				teamId: updatedRule.teamId,
				updated_at: updatedRule.updatedAt,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
