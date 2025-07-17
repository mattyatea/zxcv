import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { EmailVerificationService } from "../../services/emailVerification";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId, hashPassword } from "../../utils/crypto";
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
							locale: z.string().optional(),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "User registered successfully, verification email sent",
				content: {
					"application/json": {
						schema: z.object({
							user: z.object({
								id: z.string(),
								email: z.string(),
								username: z.string(),
								emailVerified: z.boolean(),
							}),
							message: z.string(),
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
		const { email, username, password, locale } = data.body;

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
					emailVerified: false,
					createdAt: now,
					updatedAt: now,
				},
				select: {
					id: true,
					email: true,
					username: true,
					emailVerified: true,
				},
			});

			// Send verification email
			const emailVerificationService = new EmailVerificationService(prisma, env);
			const emailSent = await emailVerificationService.sendVerificationEmail(
				user.id,
				email,
				locale,
			);

			if (!emailSent) {
				// If email failed to send, we still return success but with a warning
				return c.json(
					{
						user,
						message:
							"User registered successfully, but verification email could not be sent. You can request a new verification email later.",
					},
					201,
				);
			}

			return c.json(
				{
					user,
					message: "User registered successfully. Please check your email to verify your account.",
				},
				201,
			);
		} catch (_error) {
			// console.error("Registration error:", error);
			return c.json({ error: "Failed to register user" }, 500);
		}
	}
}
