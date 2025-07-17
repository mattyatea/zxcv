import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { verifyPassword } from "../../utils/crypto";
import { generateToken } from "../../utils/jwt";
import { createPrismaClient } from "../../utils/prisma";

export class LoginEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Authentication"],
		summary: "Login user",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							email: z.string().email(),
							password: z.string(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Login successful",
				content: {
					"application/json": {
						schema: z.object({
							user: z.object({
								id: z.string(),
								email: z.string(),
								username: z.string(),
							}),
							token: z.string(),
						}),
					},
				},
			},
			"401": {
				description: "Invalid credentials",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { email, password } = data.body;

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// Find user
			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				return c.json({ error: "Invalid credentials" }, 401);
			}

			// Verify password
			const isValid = await verifyPassword(password, user.passwordHash);
			if (!isValid) {
				return c.json({ error: "Invalid credentials" }, 401);
			}

			// Generate JWT
			const token = await generateToken(
				{ userId: user.id, email: user.email },
				env.JWT_SECRET,
				env.JWT_ALGORITHM,
				env.JWT_EXPIRES_IN,
			);

			return c.json({
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
				},
				token,
			});
		} catch (_error) {
			// console.error("Login error:", error);
			return c.json({ error: "Login failed" }, 500);
		}
	}
}
