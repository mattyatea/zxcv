import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { EmailVerificationService } from "~/server/services/emailVerification";
import { createPrismaClient } from "~/server/utils/prisma";

const verifyEmailSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = verifyEmailSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: validation.error.errors[0]?.message || "Invalid request data",
		});
	}
	
	const { token } = validation.data;
	const prisma = createPrismaClient(env.DB);
	
	try {
		const emailVerificationService = new EmailVerificationService(prisma, env);
		
		// Verify email
		const result = await emailVerificationService.verifyEmail(token);
		
		if (result.success) {
			return {
				success: true,
				message: "Email verified successfully",
				userId: result.userId,
			};
		}
		
		throw createError({
			statusCode: 400,
			statusMessage: result.message || "Email verification failed",
		});
	} catch (error) {
		// If it's already an H3Error, re-throw it
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Internal server error",
		});
	}
});