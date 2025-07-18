import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { EmailVerificationService } from "~/server/services/emailVerification";
import { generateId, hashPassword } from "~/server/utils/crypto";
import { createPrismaClient } from "~/server/utils/prisma";

const registerSchema = z.object({
	email: z.string().email(),
	username: z
		.string()
		.min(3)
		.max(50)
		.regex(/^[a-zA-Z0-9_-]+$/),
	password: z.string().min(8),
	locale: z.string().optional(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = registerSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const { email, username, password, locale } = validation.data;
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Check if user exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		});
		
		if (existingUser) {
			throw createError({
				statusCode: 409,
				statusMessage: "User with this email or username already exists",
			});
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
			return {
				user,
				message: "User registered successfully, but verification email could not be sent. You can request a new verification email later.",
			};
		}
		
		return {
			user,
			message: "User registered successfully. Please check your email to verify your account.",
		};
	} catch (error) {
		// If it's already an H3Error, re-throw it
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to register user",
		});
	}
});