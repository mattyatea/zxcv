import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { EmailVerificationService } from "~/server/services/emailVerification";
import { createPrismaClient } from "~/server/utils/prisma";

const sendVerificationSchema = z.object({
	email: z.string().email("Valid email address is required"),
	locale: z.string().optional(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = sendVerificationSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: validation.error.errors[0]?.message || "Invalid request data",
		});
	}
	
	const { email, locale } = validation.data;
	const prisma = createPrismaClient(env.DB);
	
	try {
		const emailVerificationService = new EmailVerificationService(prisma, env);
		
		// Send verification email (returns true even if email doesn't exist for security)
		const sent = await emailVerificationService.resendVerificationEmail(email, locale);
		
		if (sent) {
			return {
				success: true,
				message: "If this email address exists and is not already verified, a verification email has been sent.",
			};
		}
		
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to send verification email. Please try again.",
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