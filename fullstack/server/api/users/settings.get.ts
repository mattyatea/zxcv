import type { H3EventContext } from "~/server/types/bindings";
import type { UserSettings } from "~/server/types/models";
import { requireAuth } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Require authentication
	const user = await requireAuth(event);
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Get user settings from database
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
		
		// Parse settings JSON with defaults
		let settings: UserSettings = {};
		try {
			settings = userRow.settings ? JSON.parse(userRow.settings) : {};
		} catch {
			settings = {};
		}
		
		// Return settings with defaults in expected format
		return {
			settings: {
				locale: settings.locale || "en",
				theme: settings.theme || "light",
				timezone: settings.timezone || "UTC",
				notifications: {
					email: settings.notifications?.email ?? true,
					push: settings.notifications?.push ?? true,
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
			statusMessage: "Failed to fetch settings",
		});
	}
});