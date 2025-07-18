import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { requireEmailVerification, getAuthFromEvent } from "~/server/utils/auth";
import { generateId, hashPassword } from "~/server/utils/crypto";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";

const createApiKeySchema = z.object({
	name: z.string().min(1).max(100),
	scopes: z
		.array(
			z.enum([
				"rules:read",
				"rules:write",
				"teams:read",
				"teams:write",
				"users:read",
				"users:write",
				"api_keys:read",
				"api_keys:write",
			]),
		)
		.optional(),
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
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = createApiKeySchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const { name, scopes, expires_at } = validation.data;
	
	// Validate expiration time if provided
	if (expires_at) {
		const now = Math.floor(Date.now() / 1000);
		if (expires_at <= now) {
			throw createError({
				statusCode: 400,
				statusMessage: "Expiration time must be in the future",
			});
		}
	}
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Generate API key
		const apiKeyId = generateId();
		const apiKey = `ak_${generateId()}${generateId()}`;
		const keyHash = await hashPassword(apiKey);
		const now = Math.floor(Date.now() / 1000);
		
		// Create API key record
		const createdApiKey = await prisma.apiKey.create({
			data: {
				id: apiKeyId,
				userId: user.id,
				name,
				keyHash,
				scopes: scopes ? JSON.stringify(scopes) : null,
				expiresAt: expires_at || null,
				createdAt: now,
			},
		});
		
		setResponseStatus(event, 201);
		return {
			id: createdApiKey.id,
			name: createdApiKey.name,
			key: apiKey, // Only returned once
			scopes: createdApiKey.scopes ? JSON.parse(createdApiKey.scopes) : [],
			expires_at: createdApiKey.expiresAt,
			created_at: createdApiKey.createdAt,
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