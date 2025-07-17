import { ApiException, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";

export class GetProfileEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Get current user profile",
		security: [{ bearerAuth: [] }],
		responses: {
			"200": {
				description: "User profile retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							email: z.string(),
							username: z.string(),
							created_at: z.number(),
							updated_at: z.number(),
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

		const env = c.env as Env;

		// Get user profile from database
		const userProfile = await env.DB.prepare(
			"SELECT id, email, username, created_at, updated_at FROM users WHERE id = ?",
		)
			.bind(user.id)
			.first<{
				id: string;
				email: string;
				username: string;
				created_at: number;
				updated_at: number;
			}>();

		if (!userProfile) {
			throw new ApiException("User not found");
		}

		return c.json({
			id: userProfile.id,
			email: userProfile.email,
			username: userProfile.username,
			created_at: userProfile.created_at,
			updated_at: userProfile.updated_at,
		});
	}
}
