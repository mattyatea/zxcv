import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import type { SqlUpdateValue } from "../../types/models";

export class UpdateProfileEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Update current user profile",
		security: [{ bearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							email: z.string().email().optional(),
							username: z
								.string()
								.min(3)
								.max(50)
								.regex(/^[a-zA-Z0-9_-]+$/)
								.optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Profile updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							email: z.string(),
							username: z.string(),
							created_at: z.number(),
							updated_at: z.number(),
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
			"409": {
				description: "Email or username already exists",
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

		if (!updates.email && !updates.username) {
			return c.json({ error: "At least one field must be provided" }, 400 as const);
		}

		const env = c.env as Env;

		// Check if email or username already exists (if being updated)
		if (updates.email) {
			const existingEmailUser = await env.DB.prepare(
				"SELECT id FROM users WHERE email = ? AND id != ?",
			)
				.bind(updates.email, user.id)
				.first<{ id: string }>();

			if (existingEmailUser) {
				return c.json({ error: "Email already exists" }, 409 as const);
			}
		}

		if (updates.username) {
			const existingUsernameUser = await env.DB.prepare(
				"SELECT id FROM users WHERE username = ? AND id != ?",
			)
				.bind(updates.username, user.id)
				.first<{ id: string }>();

			if (existingUsernameUser) {
				return c.json({ error: "Username already exists" }, 409 as const);
			}
		}

		// Build update query dynamically
		const updateFields: string[] = [];
		const updateValues: SqlUpdateValue[] = [];

		if (updates.email) {
			updateFields.push("email = ?");
			updateValues.push(updates.email);
		}

		if (updates.username) {
			updateFields.push("username = ?");
			updateValues.push(updates.username);
		}

		updateFields.push("updated_at = ?");
		updateValues.push(Math.floor(Date.now() / 1000));

		updateValues.push(user.id); // For WHERE clause

		const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

		try {
			await env.DB.prepare(updateQuery)
				.bind(...updateValues)
				.run();

			// Get updated user profile
			const updatedProfile = await env.DB.prepare(
				"SELECT id, email, username, created_at, updated_at FROM users WHERE id = ?",
			)
				.bind(user.id)
				.first<{
					id: string;
					email: string;
					username: string;
					created_at: number;
					updated_at: number;
				}>();

			if (!updatedProfile) {
				return c.json({ error: "User not found" }, 404 as const);
			}

			return c.json({
				id: updatedProfile.id,
				email: updatedProfile.email,
				username: updatedProfile.username,
				created_at: updatedProfile.created_at,
				updated_at: updatedProfile.updated_at,
			});
		} catch (_error) {
			return c.json({ error: "Failed to update profile" }, 500 as const);
		}
	}
}
