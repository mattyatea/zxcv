import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import type { UserSettings } from "~/server/types/models";
import { requireAuth } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";

const updateSettingsSchema = z.object({
	locale: z
		.string()
		.regex(/^[a-z]{2}(-[A-Z]{2})?$/)
		.optional(),
	theme: z.enum(["light", "dark"]).optional(),
	timezone: z
		.string()
		.refine((val) => {
			if (val === "UTC") {
				return true;
			}
			// Only allow well-known timezone patterns
			const validPatterns = [
				/^America\/[A-Z][a-z_]+$/,
				/^Europe\/[A-Z][a-z_]+$/,
				/^Asia\/[A-Z][a-z_]+$/,
				/^Africa\/[A-Z][a-z_]+$/,
				/^Australia\/[A-Z][a-z_]+$/,
			];
			return validPatterns.some((pattern) => pattern.test(val));
		})
		.optional(),
	notifications: z
		.object({
			email: z.boolean().optional(),
			push: z.boolean().optional(),
		})
		.optional(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Require authentication
	const user = await requireAuth(event);
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = updateSettingsSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const updates = validation.data;
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Get current settings
		const userRow = await prisma.user.findUnique({
			where: { id: user.id },
			select: { settings: true },
		});
		
		if (!userRow) {
			throw createError({
				statusCode: 404,
				statusMessage: "User not found",
			});
		}
		
		// Parse current settings
		let currentSettings: UserSettings = {};
		try {
			currentSettings = userRow.settings ? JSON.parse(userRow.settings) : {};
		} catch {
			currentSettings = {};
		}
		
		// Merge with updates
		const updatedSettings = {
			...currentSettings,
			...updates,
		};
		
		// Merge notifications if provided
		if (updates.notifications) {
			updatedSettings.notifications = {
				...currentSettings.notifications,
				...updates.notifications,
			};
		}
		
		// Update in database
		await prisma.user.update({
			where: { id: user.id },
			data: {
				settings: JSON.stringify(updatedSettings),
				updatedAt: Math.floor(Date.now() / 1000),
			},
		});
		
		// Return updated settings with defaults in expected format
		return {
			settings: {
				locale: updatedSettings.locale || "en",
				theme: updatedSettings.theme || "light",
				timezone: updatedSettings.timezone || "UTC",
				notifications: {
					email: updatedSettings.notifications?.email ?? true,
					push: updatedSettings.notifications?.push ?? true,
				},
			},
		};
	} catch (error) {
		// If it's already an H3Error, re-throw it
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to update settings",
		});
	}
});