import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { verifyPassword } from "~/server/utils/crypto";
import { createJWT } from "~/server/utils/jwt";
import { createPrismaClient } from "~/server/utils/prisma";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = loginSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const { email, password } = validation.data;
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Find user
		const user = await prisma.user.findUnique({
			where: { email },
		});
		
		if (!user) {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid credentials",
			});
		}
		
		// Verify password
		const isValid = await verifyPassword(password, user.passwordHash);
		if (!isValid) {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid credentials",
			});
		}
		
		// Check if email is verified
		if (!user.emailVerified) {
			return {
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					emailVerified: user.emailVerified,
				},
				message: "Email verification required. Please verify your email address to access your account.",
			};
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
		
		return {
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				emailVerified: user.emailVerified,
			},
			token,
		};
	} catch (error) {
		// If it's already an H3Error, re-throw it
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Login failed",
		});
	}
});