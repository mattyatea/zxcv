import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class DeleteTeamEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Teams"],
		summary: "Delete team",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			"204": {
				description: "Team deleted successfully",
			},
			"401": {
				description: "Authentication required",
			},
			"403": {
				description: "Not authorized to delete this team",
			},
			"404": {
				description: "Team not found",
			},
		},
	};

	async handle(c: AppContext) {
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// First check if team exists
			const teamExists = await prisma.team.findUnique({
				where: { id },
			});

			if (!teamExists) {
				return c.json({ error: "Team not found" }, 404 as const);
			}

			// Check if user is owner of this team
			const team = await prisma.team.findFirst({
				where: {
					id,
					ownerId: user.id,
				},
			});

			if (!team) {
				return c.json({ error: "Not authorized to delete this team" }, 403 as const);
			}

			// Delete team (cascading will handle team members)
			await prisma.team.delete({
				where: { id },
			});

			return c.body(null, 204 as const);
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
