import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { requireEmailVerification, getAuthFromEvent } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";

const querySchema = z.object({
	limit: z.string().optional().default("20"),
	offset: z.string().optional().default("0"),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Require authentication and email verification
	const user = await requireEmailVerification(event);
	
	// Check scope for API key authentication
	const auth = await getAuthFromEvent(event);
	if (auth.apiKeyScopes && !auth.apiKeyScopes.includes("api_keys:read")) {
		throw createError({
			statusCode: 403,
			statusMessage: "Insufficient scope",
		});
	}
	
	// Parse and validate query parameters
	const query = getQuery(event);
	const validation = querySchema.safeParse(query);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid query parameters",
			data: validation.error.flatten(),
		});
	}
	
	const limit = Number.parseInt(validation.data.limit);
	const offset = Number.parseInt(validation.data.offset);
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Get API keys for the user
		const apiKeys = await prisma.apiKey.findMany({
			where: {
				userId: user.id,
			},
			select: {
				id: true,
				name: true,
				scopes: true,
				expiresAt: true,
				lastUsedAt: true,
				createdAt: true,
				// keyHash is excluded for security
			},
			skip: offset,
			take: limit,
			orderBy: {
				createdAt: "desc",
			},
		});
		
		// Get total count
		const totalCount = await prisma.apiKey.count({
			where: {
				userId: user.id,
			},
		});
		
		const results = apiKeys.map(
			(apiKey: {
				id: string;
				name: string;
				scopes: string | null;
				expiresAt: number | null;
				lastUsedAt: number | null;
				createdAt: number;
			}) => ({
				id: apiKey.id,
				name: apiKey.name,
				scopes: apiKey.scopes ? JSON.parse(apiKey.scopes) : [],
				expires_at: apiKey.expiresAt,
				last_used_at: apiKey.lastUsedAt,
				created_at: apiKey.createdAt,
			}),
		);
		
		return {
			results,
			total: totalCount,
			limit,
			offset,
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