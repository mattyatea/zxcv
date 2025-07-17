import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { createJWT } from "../../middleware/auth";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId, hashPassword } from "../../utils/crypto";
import { createRefreshToken } from "../../utils/jwt";

export class RegisterEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Register a new user",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							email: z.string().email(),
							username: z
								.string()
								.min(3)
								.max(20)
								.regex(/^[a-zA-Z0-9_-]+$/),
							password: z.string().min(8),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "User created successfully",
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
			"409": {
				description: "User already exists",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { email, username, password } = data.body;

		const env = c.env as Env;

		// Check if user already exists
		const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ? OR username = ?")
			.bind(email, username)
			.first();

		if (existing) {
			return c.json({ error: "User already exists" }, 409);
		}

		// Create user
		const userId = generateId();
		const passwordHash = await hashPassword(password);
		const now = Math.floor(Date.now() / 1000);

		await env.DB.prepare(
			"INSERT INTO users (id, email, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		)
			.bind(userId, email, username, passwordHash, now, now)
			.run();

		// Create JWT token and refresh token
		const user = { id: userId, email, username };
		const token = await createJWT(user, env);
		const refreshToken = await createRefreshToken(userId, env);

		return c.json(
			{
				token,
				refreshToken,
				user,
			},
			201,
		);
	}
}
