import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId, hashPassword } from "../../utils/crypto";
import { generateToken } from "../../utils/jwt";
import { createPrismaClient } from "../../utils/prisma";

export class RegisterEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Authentication"],
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
								.max(50)
								.regex(/^[a-zA-Z0-9_-]+$/),
							password: z.string().min(8),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "User registered successfully",
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
			"409": {
				description: "User already exists",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { email, username, password } = data.body;

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// Check if user exists
			const existingUser = await prisma.user.findFirst({
				where: {
					OR: [{ email }, { username }],
				},
			});

			if (existingUser) {
				return c.json({ error: "User with this email or username already exists" }, 409);
			}

			// Hash password
			const passwordHash = await hashPassword(password);

			// Create user
			const userId = generateId();
			const now = Math.floor(Date.now() / 1000);

			const user = await prisma.user.create({
				data: {
					id: userId,
					email,
					username,
					passwordHash,
					createdAt: now,
					updatedAt: now,
				},
				select: {
					id: true,
					email: true,
					username: true,
				},
			});

			// Generate JWT
			const token = await generateToken(
				{ userId: user.id, email: user.email },
				env.JWT_SECRET,
				env.JWT_ALGORITHM,
				env.JWT_EXPIRES_IN,
			);

			return c.json(
				{
					user,
					token,
				},
				201,
			);
		} catch (_error) {
			// console.error("Registration error:", error);
			return c.json({ error: "Failed to register user" }, 500);
		}
	}
}
