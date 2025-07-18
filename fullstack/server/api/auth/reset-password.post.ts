import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { hashPassword } from "~/server/utils/crypto";
import { createPrismaClient } from "~/server/utils/prisma";

const resetPasswordSchema = z.object({
	token: z.string(),
	newPassword: z.string().min(8),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = resetPasswordSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const { token, newPassword } = validation.data;
	const prisma = createPrismaClient(env.DB);
	const now = Math.floor(Date.now() / 1000);
	
	try {
		// Find valid reset token
		const reset = await prisma.passwordReset.findFirst({
			where: {
				token,
				expiresAt: { gt: now },
				usedAt: null,
			},
			select: {
				id: true,
				userId: true,
			},
		});
		
		if (!reset) {
			throw createError({
				statusCode: 400,
				statusMessage: "Invalid or expired token",
			});
		}
		
		// Hash new password
		const passwordHash = await hashPassword(newPassword);
		
		// Update password and mark token as used sequentially (D1 doesn't support transactions)
		// Update user password first
		await prisma.user.update({
			where: { id: reset.userId },
			data: {
				passwordHash,
				updatedAt: now,
			},
		});
		
		try {
			// Mark token as used
			await prisma.passwordReset.update({
				where: { id: reset.id },
				data: {
					usedAt: now,
				},
			});
		} catch (_error) {
			// Ignore error if token cleanup fails
		}
		
		return {
			message: "Password reset successfully",
		};
	} catch (error) {
		// If it's already an H3Error, re-throw it
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Password reset failed",
		});
	}
});