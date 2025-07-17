import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import type { UserSettings } from "../../types/models";

export class GetSettingsEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Get current user settings",
		security: [{ bearerAuth: [] }],
		responses: {
			"200": {
				description: "User settings retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							settings: z.object({
								locale: z.string().default("en"),
								theme: z.string().default("light"),
								timezone: z.string().default("UTC"),
								notifications: z
									.object({
										email: z.boolean().default(true),
										push: z.boolean().default(true),
									})
									.default({ email: true, push: true }),
							}),
						}),
					},
				},
			},
			"401": {
				description: "Authentication required",
			},
		},
	};

	async handle(c: AppContext) {
		const user = c.get("user");
		if (!user) {
			return c.json({ error: "Authentication required" }, 401 as const);
		}

		const env = c.env as Env;

		// Get user settings from database
		const userRow = await env.DB.prepare("SELECT settings FROM users WHERE id = ?")
			.bind(user.id)
			.first<{ settings: string }>();

		if (!userRow) {
			return c.json({ error: "User not found" }, 404 as const);
		}

		// Parse settings JSON with defaults
		let settings: UserSettings = {};
		try {
			settings = JSON.parse(userRow.settings || "{}");
		} catch {
			settings = {};
		}

		// Return settings with defaults in expected format
		return c.json({
			settings: {
				locale: settings.locale || "en",
				theme: settings.theme || "light",
				timezone: settings.timezone || "UTC",
				notifications: {
					email: settings.notifications?.email ?? true,
					push: settings.notifications?.push ?? true,
				},
			},
		});
	}
}
