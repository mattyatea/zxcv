import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { createJWT } from "../../middleware/auth";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { verifyPassword } from "../../utils/crypto";
import { createRefreshToken } from "../../utils/jwt";

export class LoginEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Login with email and password",
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
							token: z.string(),
							refreshToken: z.string(),
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
				description: "Invalid credentials",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { email, password } = data.body;

		const env = c.env as Env;

		// Find user
		const user = await env.DB.prepare(
			"SELECT id, email, username, password_hash FROM users WHERE email = ?",
		)
			.bind(email)
			.first<{ id: string; email: string; username: string; password_hash: string }>();

		if (!user) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		// Verify password
		const isValid = await verifyPassword(password, user.password_hash);

		if (!isValid) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		// Update last login
		await env.DB.prepare("UPDATE users SET updated_at = ? WHERE id = ?")
			.bind(Math.floor(Date.now() / 1000), user.id)
			.run();

		// Create JWT token and refresh token
		const userInfo = { id: user.id, email: user.email, username: user.username };
		const token = await createJWT(userInfo, env);
		const refreshToken = await createRefreshToken(user.id, env);

		return c.json({
			token,
			refreshToken,
			user: userInfo,
		});
	}
}
