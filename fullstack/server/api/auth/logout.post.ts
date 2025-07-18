import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { verifyRefreshToken } from "~/server/utils/jwt";
import { createPrismaClient } from "~/server/utils/prisma";

const logoutSchema = z.object({
	refreshToken: z.string(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = logoutSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const { refreshToken } = validation.data;
	const _prisma = createPrismaClient(env.DB);
	
	try {
		// Verify refresh token
		const userId = await verifyRefreshToken(refreshToken, env);
		if (!userId) {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid refresh token",
			});
		}
		
		// In a JWT-based system, logout is typically handled client-side
		// by removing the token. For simplicity, we'll just return success
		// In a production system, you might want to implement token blacklisting
		// or store refresh tokens in the database and remove them on logout
		
		return {
			success: true,
			message: "Successfully logged out",
		};
	} catch (error) {
		// If it's already an H3Error, re-throw it
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Logout failed",
		});
	}
});