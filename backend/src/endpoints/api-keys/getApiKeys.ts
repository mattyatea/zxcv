import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class GetApiKeysEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["API Keys"],
		summary: "Get user's API keys",
		security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				limit: z.string().optional().default("20"),
				offset: z.string().optional().default("0"),
			}),
		},
		responses: {
			"200": {
				description: "API keys retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							results: z.array(
								z.object({
									id: z.string(),
									name: z.string(),
									scopes: z.array(z.string()),
									expires_at: z.number().nullable(),
									last_used_at: z.number().nullable(),
									created_at: z.number(),
								}),
							),
							total: z.number(),
							limit: z.number(),
							offset: z.number(),
						}),
					},
				},
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
		const limit = Number.parseInt(data.query.limit);
		const offset = Number.parseInt(data.query.offset);

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// Get API keys for the user
			const apiKeys = await prisma.apiKey.findMany({
				where: {
					userId: user.id,
				},
				select: {
					id: true,
					name: true,
					scopes: true,
					expiresAt: true,
					lastUsedAt: true,
					createdAt: true,
					// keyHash is excluded for security
				},
				skip: offset,
				take: limit,
				orderBy: {
					createdAt: "desc",
				},
			});

			// Get total count
			const totalCount = await prisma.apiKey.count({
				where: {
					userId: user.id,
				},
			});

			const results = apiKeys.map(
				(apiKey: {
					id: string;
					name: string;
					scopes: string | null;
					expiresAt: number | null;
					lastUsedAt: number | null;
					createdAt: number;
				}) => ({
					id: apiKey.id,
					name: apiKey.name,
					scopes: apiKey.scopes ? JSON.parse(apiKey.scopes) : [],
					expires_at: apiKey.expiresAt,
					last_used_at: apiKey.lastUsedAt,
					created_at: apiKey.createdAt,
				}),
			);

			return c.json({
				results,
				total: totalCount,
				limit,
				offset,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
