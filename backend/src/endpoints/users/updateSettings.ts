import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import type { UserSettings } from "../../types/models";

export class UpdateSettingsEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Update current user settings",
		security: [{ bearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
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
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Settings updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							settings: z.object({
								locale: z.string(),
								theme: z.string(),
								timezone: z.string(),
								notifications: z.object({
									email: z.boolean(),
									push: z.boolean(),
								}),
							}),
						}),
					},
				},
			},
			"400": {
				description: "Invalid input data",
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

		const data = await this.getValidatedData<typeof this.schema>();
		const updates = data.body;

		const env = c.env as Env;

		// Get current settings
		const userRow = await env.DB.prepare("SELECT settings FROM users WHERE id = ?")
			.bind(user.id)
			.first<{ settings: string }>();

		if (!userRow) {
			return c.json({ error: "User not found" }, 404 as const);
		}

		// Parse current settings
		let currentSettings: UserSettings = {};
		try {
			currentSettings = JSON.parse(userRow.settings || "{}");
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
		try {
			await env.DB.prepare("UPDATE users SET settings = ?, updated_at = ? WHERE id = ?")
				.bind(JSON.stringify(updatedSettings), Math.floor(Date.now() / 1000), user.id)
				.run();

			// Return updated settings with defaults in expected format
			return c.json({
				settings: {
					locale: updatedSettings.locale || "en",
					theme: updatedSettings.theme || "light",
					timezone: updatedSettings.timezone || "UTC",
					notifications: {
						email: updatedSettings.notifications?.email ?? true,
						push: updatedSettings.notifications?.push ?? true,
					},
				},
			});
		} catch (_error) {
			return c.json({ error: "Failed to update settings" }, 500 as const);
		}
	}
}
