import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { createJWT as createAuthJWT } from "../../middleware/auth";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { verifyRefreshToken } from "../../utils/jwt";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class RefreshTokenEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Refresh access token",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							refreshToken: z.string(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Token refreshed successfully",
				content: {
					"application/json": {
						schema: z.object({
							token: z.string(),
							user: z.object({
								id: z.string(),
								email: z.string(),
								username: z.string(),
							}),
						}),
					},
				},
			},
			"401": {
				description: "Invalid refresh token",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { refreshToken } = data.body;

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// Verify refresh token
			const userId = await verifyRefreshToken(refreshToken, env);
			if (!userId) {
				return c.json({ error: "Invalid refresh token" }, 401);
			}

			// Get user from database
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					email: true,
					username: true,
					emailVerified: true,
				},
			});

			if (!user) {
				return c.json({ error: "User not found" }, 401);
			}

			// Create new access token
			const token = await createAuthJWT(
				{
					id: user.id,
					email: user.email,
					username: user.username,
					emailVerified: user.emailVerified,
				},
				env,
			);

			return c.json({
				token,
				user,
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
