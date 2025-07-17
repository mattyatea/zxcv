import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { verifyPassword } from "../../utils/crypto";
import { createJWT } from "../../utils/jwt";
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
								emailVerified: z.boolean(),
							}),
							token: z.string().optional(),
							message: z.string().optional(),
						}),
					},
				},
			},
			"401": {
				description: "Invalid credentials",
			},
			"403": {
				description: "Email verification required",
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

			// Check if email is verified
			if (!user.emailVerified) {
				return c.json(
					{
						user: {
							id: user.id,
							email: user.email,
							username: user.username,
							emailVerified: user.emailVerified,
						},
						message:
							"Email verification required. Please verify your email address to access your account.",
					},
					403,
				);
			}

			// Generate JWT
			const token = await createJWT(
				{
					sub: user.id,
					email: user.email,
					username: user.username,
					emailVerified: user.emailVerified,
				},
				env,
			);

			return c.json({
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					emailVerified: user.emailVerified,
				},
				token,
			});
		} catch (_error) {
			// console.error("Login error:", error);
			return c.json({ error: "Login failed" }, 500);
		}
	}
}
