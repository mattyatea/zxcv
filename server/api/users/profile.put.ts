import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { requireAuth } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";

const updateProfileSchema = z.object({
	email: z.string().email().optional(),
	username: z
		.string()
		.min(3)
		.max(50)
		.regex(/^[a-zA-Z0-9_-]+$/)
		.optional(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Require authentication
	const user = await requireAuth(event);
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = updateProfileSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const updates = validation.data;
	
	if (!updates.email && !updates.username) {
		throw createError({
			statusCode: 400,
			statusMessage: "At least one field must be provided",
		});
	}
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Check if email already exists (if being updated)
		if (updates.email) {
			const existingEmailUser = await prisma.user.findFirst({
				where: {
					email: updates.email,
					NOT: { id: user.id },
				},
			});
			
			if (existingEmailUser) {
				throw createError({
					statusCode: 409,
					statusMessage: "Email already exists",
				});
			}
		}
		
		// Check if username already exists (if being updated)
		if (updates.username) {
			const existingUsernameUser = await prisma.user.findFirst({
				where: {
					username: updates.username,
					NOT: { id: user.id },
				},
			});
			
			if (existingUsernameUser) {
				throw createError({
					statusCode: 409,
					statusMessage: "Username already exists",
				});
			}
		}
		
		// Update user profile
		const updatedProfile = await prisma.user.update({
			where: { id: user.id },
			data: {
				...(updates.email && { email: updates.email }),
				...(updates.username && { username: updates.username }),
				updatedAt: Math.floor(Date.now() / 1000),
			},
			select: {
				id: true,
				email: true,
				username: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		
		return {
			id: updatedProfile.id,
			email: updatedProfile.email,
			username: updatedProfile.username,
			created_at: updatedProfile.createdAt,
			updated_at: updatedProfile.updatedAt,
		};
	} catch (error) {
		// If it's already an H3Error, re-throw it
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to update profile",
		});
	}
});