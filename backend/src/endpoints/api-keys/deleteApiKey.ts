import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class DeleteApiKeyEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["API Keys"],
		summary: "Delete an API key",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			"204": {
				description: "API key deleted successfully",
			},
			"401": {
				description: "Authentication required",
			},
			"404": {
				description: "API key not found",
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
			// Check if API key exists and belongs to the user
			const apiKey = await prisma.apiKey.findFirst({
				where: {
					id,
					userId: user.id,
				},
			});

			if (!apiKey) {
				return c.json({ error: "API key not found" }, 404 as const);
			}

			// Delete the API key
			await prisma.apiKey.delete({
				where: { id },
			});

			return c.body(null, 204 as const);
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
