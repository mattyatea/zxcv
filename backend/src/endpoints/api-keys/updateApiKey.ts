import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import type { ApiKeyUpdateData } from "../../types/models";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class UpdateApiKeyEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["API Keys"],
		summary: "Update an API key",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z.string().min(1).max(100).optional(),
							scopes: z.array(z.string()).optional(),
							expires_at: z.number().optional(), // Unix timestamp
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "API key updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							name: z.string(),
							scopes: z.array(z.string()),
							expires_at: z.number().nullable(),
							last_used_at: z.number().nullable(),
							created_at: z.number(),
						}),
					},
				},
			},
			"400": {
				description: "Invalid input data",
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
		const updates = data.body;

		if (!updates.name && !updates.scopes && updates.expires_at === undefined) {
			return c.json({ error: "At least one field must be provided" }, 400 as const);
		}

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

			// Prepare update data
			const updateData: ApiKeyUpdateData = {};

			if (updates.name) {
				updateData.name = updates.name;
			}

			if (updates.scopes) {
				updateData.scopes = JSON.stringify(updates.scopes);
			}

			if (updates.expires_at !== undefined) {
				updateData.expiresAt = updates.expires_at;
			}

			// Update the API key
			const updatedApiKey = await prisma.apiKey.update({
				where: { id },
				data: updateData,
			});

			return c.json({
				id: updatedApiKey.id,
				name: updatedApiKey.name,
				scopes: updatedApiKey.scopes ? JSON.parse(updatedApiKey.scopes) : [],
				expires_at: updatedApiKey.expiresAt,
				last_used_at: updatedApiKey.lastUsedAt,
				created_at: updatedApiKey.createdAt,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
