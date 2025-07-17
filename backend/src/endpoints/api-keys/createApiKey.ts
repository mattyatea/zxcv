import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId, hashPassword } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class CreateApiKeyEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["API Keys"],
		summary: "Create a new API key",
		security: [{ bearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z.string().min(1).max(100),
							scopes: z
								.array(
									z.enum([
										"rules:read",
										"rules:write",
										"teams:read",
										"teams:write",
										"users:read",
										"users:write",
										"api_keys:read",
										"api_keys:write",
									]),
								)
								.optional(),
							expires_at: z.number().optional(), // Unix timestamp
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "API key created successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							name: z.string(),
							key: z.string(), // Only returned once
							scopes: z.array(z.string()),
							expires_at: z.number().nullable(),
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
		},
	};

	async handle(c: AppContext) {
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { name, scopes, expires_at } = data.body;

		// Validate expiration time if provided
		if (expires_at) {
			const now = Math.floor(Date.now() / 1000);
			if (expires_at <= now) {
				return c.json({ error: "Expiration time must be in the future" }, 400 as const);
			}
		}

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// Generate API key
			const apiKeyId = generateId();
			const apiKey = `ak_${generateId()}${generateId()}`;
			const keyHash = await hashPassword(apiKey);
			const now = Math.floor(Date.now() / 1000);

			// Create API key record
			const createdApiKey = await prisma.apiKey.create({
				data: {
					id: apiKeyId,
					userId: user.id,
					name,
					keyHash,
					scopes: scopes ? JSON.stringify(scopes) : null,
					expiresAt: expires_at || null,
					createdAt: now,
				},
			});

			return c.json(
				{
					id: createdApiKey.id,
					name: createdApiKey.name,
					key: apiKey, // Only returned once
					scopes: createdApiKey.scopes ? JSON.parse(createdApiKey.scopes) : [],
					expires_at: createdApiKey.expiresAt,
					created_at: createdApiKey.createdAt,
				},
				201 as const,
			);
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
