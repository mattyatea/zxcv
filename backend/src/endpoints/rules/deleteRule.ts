import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";
import { canDeleteTeamRule } from "../../utils/teams";

export class DeleteRuleEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules"],
		summary: "Delete a rule",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			"204": {
				description: "Rule deleted successfully",
			},
			"401": {
				description: "Unauthorized",
			},
			"404": {
				description: "Rule not found",
			},
		},
	};

	async handle(c: AppContext) {
		await requireAuth(c, async () => {
			// Authentication verified by middleware
		});

		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;

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
				include: {
					versions: {
						select: {
							r2ObjectKey: true,
						},
					},
				},
			});

			if (!rule) {
				return c.json({ error: "Rule not found" }, 404 as const);
			}

			// Check permissions based on ownership or team membership
			if (rule.userId !== user.id) {
				// If not the owner, check if they have team delete permissions
				if (rule.teamId && rule.visibility === "team") {
					const canDelete = await canDeleteTeamRule(prisma, user.id, rule.teamId);
					if (!canDelete) {
						return c.json({ error: "Unauthorized" }, 401 as const);
					}
				} else {
					return c.json({ error: "Unauthorized" }, 401 as const);
				}
			}

			// Delete from R2
			const deletePromises = rule.versions.map((version) => env.R2.delete(version.r2ObjectKey));
			await Promise.all(deletePromises);

			// Delete from database (cascade will handle versions)
			await prisma.rule.delete({
				where: { id },
			});

			return c.body(null, 204 as const);
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
