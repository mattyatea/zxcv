import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { verifyRefreshToken } from "../../utils/jwt";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class LogoutEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Logout user",
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
				description: "Successfully logged out",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
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
		const _prisma = createPrismaClient(env.DB);

		try {
			// Verify refresh token
			const userId = await verifyRefreshToken(refreshToken, env);
			if (!userId) {
				return c.json({ error: "Invalid refresh token" }, 401);
			}

			// In a JWT-based system, logout is typically handled client-side
			// by removing the token. For simplicity, we'll just return success
			// In a production system, you might want to implement token blacklisting
			// or store refresh tokens in the database and remove them on logout

			return c.json({
				success: true,
				message: "Successfully logged out",
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
