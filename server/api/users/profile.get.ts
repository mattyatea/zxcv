import type { H3EventContext } from "~/server/types/bindings";
import { requireAuth } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Require authentication
	const user = await requireAuth(event);
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Get user profile from database
		const userProfile = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				username: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		
		if (!userProfile) {
			throw createError({
				statusCode: 404,
				statusMessage: "User not found",
			});
		}
		
		return {
			id: userProfile.id,
			email: userProfile.email,
			username: userProfile.username,
			created_at: userProfile.createdAt,
			updated_at: userProfile.updatedAt,
		};
	} catch (error) {
		// If it's already an H3Error, re-throw it
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to fetch profile",
		});
	}
});