import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { requireEmailVerification, getAuthFromEvent } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import type { ApiKeyUpdateData } from "~/server/types/models";

const updateApiKeySchema = z.object({
	name: z.string().min(1).max(100).optional(),
	scopes: z.array(z.string()).optional(),
	expires_at: z.number().optional(), // Unix timestamp
});

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
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = updateApiKeySchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const updates = validation.data;
	
	if (!updates.name && !updates.scopes && updates.expires_at === undefined) {
		throw createError({
			statusCode: 400,
			statusMessage: "At least one field must be provided",
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
		
		// Prepare update data
		const updateData: ApiKeyUpdateData = {};
		
		if (updates.name) {
			updateData.name = updates.name;
		}
		
		if (updates.scopes) {
			updateData.scopes = JSON.stringify(updates.scopes);
		}
		
		if (updates.expires_at !== undefined) {
			updateData.expiresAt = updates.expires_at;
		}
		
		// Update the API key
		const updatedApiKey = await prisma.apiKey.update({
			where: { id },
			data: updateData,
		});
		
		return {
			id: updatedApiKey.id,
			name: updatedApiKey.name,
			scopes: updatedApiKey.scopes ? JSON.parse(updatedApiKey.scopes) : [],
			expires_at: updatedApiKey.expiresAt,
			last_used_at: updatedApiKey.lastUsedAt,
			created_at: updatedApiKey.createdAt,
		};
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