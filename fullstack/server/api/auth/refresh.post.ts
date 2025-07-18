import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { createJWT, verifyRefreshToken } from "~/server/utils/jwt";
import { createPrismaClient } from "~/server/utils/prisma";

const refreshSchema = z.object({
	refreshToken: z.string(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = refreshSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const { refreshToken } = validation.data;
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Verify refresh token
		const userId = await verifyRefreshToken(refreshToken, env);
		if (!userId) {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid refresh token",
			});
		}
		
		// Get user from database
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				username: true,
				emailVerified: true,
			},
		});
		
		if (!user) {
			throw createError({
				statusCode: 401,
				statusMessage: "User not found",
			});
		}
		
		// Create new access token
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
			token,
			user,
		};
	} catch (error) {
		// If it's already an H3Error, re-throw it
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Token refresh failed",
		});
	}
});