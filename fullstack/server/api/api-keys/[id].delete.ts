import type { H3EventContext } from "~/server/types/bindings";
import { requireEmailVerification, getAuthFromEvent } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Require authentication and email verification
	const user = await requireEmailVerification(event);
	
	// Check scope for API key authentication
	const auth = await getAuthFromEvent(event);
	if (auth.apiKeyScopes && !auth.apiKeyScopes.includes("api_keys:write")) {
		throw createError({
			statusCode: 403,
			statusMessage: "Insufficient scope",
		});
	}
	
	// Get API key ID from route params
	const id = getRouterParam(event, "id");
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: "API key ID is required",
		});
	}
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Check if API key exists and belongs to the user
		const apiKey = await prisma.apiKey.findFirst({
			where: {
				id,
				userId: user.id,
			},
		});
		
		if (!apiKey) {
			throw createError({
				statusCode: 404,
				statusMessage: "API key not found",
			});
		}
		
		// Delete the API key
		await prisma.apiKey.delete({
			where: { id },
		});
		
		// Return 204 No Content
		setResponseStatus(event, 204);
		return null;
	} catch (error) {
		// Re-throw if it's already an H3Error
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		const prismaError = handlePrismaError(error);
		throw createError({
			statusCode: prismaError.status,
			statusMessage: prismaError.message,
		});
	}
});