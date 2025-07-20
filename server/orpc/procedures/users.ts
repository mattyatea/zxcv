import { ORPCError } from "@orpc/server";
import * as z from "zod";
import { os } from "~/server/orpc/index";
import { dbProvider, dbWithAuth } from "~/server/orpc/middleware/combined";
import { hashPassword, verifyPassword } from "~/server/utils/crypto";

export const usersProcedures = {
	// Get user profile by username
	getProfile: os
		.use(dbProvider)
		.input(
			z.object({
				username: z.string().min(1),
			}),
		)
		.handler(async ({ input, context }) => {
			const { username } = input;
			const { db } = context;

			// Get user profile
			const user = await db.user.findUnique({
				where: { username: username.toLowerCase() },
				select: {
					id: true,
					email: true,
					username: true,
					emailVerified: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!user) {
				throw new ORPCError("NOT_FOUND", { message: "User not found" });
			}

			// Get user statistics
			const [rulesCount, teamsCount] = await Promise.all([
				db.rule.count({
					where: {
						userId: user.id,
						visibility: "public", // Only count public rules
					},
				}),
				db.teamMember.count({
					where: {
						userId: user.id,
					},
				}),
			]);

			// Get recent public rules
			const recentRules = await db.rule.findMany({
				where: {
					userId: user.id,
					visibility: "public",
				},
				select: {
					id: true,
					name: true,
					description: true,
					visibility: true,
					createdAt: true,
					updatedAt: true,
				},
				orderBy: {
					updatedAt: "desc",
				},
				take: 5,
			});

			return {
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					emailVerified: user.emailVerified,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
				stats: {
					rulesCount,
					teamsCount,
				},
				recentRules,
			};
		}),
	profile: os.use(dbWithAuth).handler(async ({ context }) => {
		const { db, user } = context;

		// Get user profile from database
		const userProfile = await db.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				username: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!userProfile) {
			throw new ORPCError("NOT_FOUND", { message: "User not found" });
		}

		return {
			id: userProfile.id,
			email: userProfile.email,
			username: userProfile.username,
			created_at: userProfile.createdAt,
			updated_at: userProfile.updatedAt,
		};
	}),

	updateProfile: os
		.use(dbWithAuth)
		.input(
			z.object({
				email: z.string().email().optional(),
				username: z
					.string()
					.min(1)
					.regex(/^[a-zA-Z0-9_-]+$/)
					.optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { email, username } = input;
			const { db, user } = context;

			// Check if email or username already exist
			if (email || username) {
				const existingUser = await db.user.findFirst({
					where: {
						AND: [
							{ id: { not: user.id } },
							{
								OR: [
									...(email ? [{ email: email.toLowerCase() }] : []),
									...(username ? [{ username: username.toLowerCase() }] : []),
								],
							},
						],
					},
				});

				if (existingUser) {
					throw new ORPCError("CONFLICT", { message: "Email or username already in use" });
				}
			}

			// Update user profile
			const updatedUser = await db.user.update({
				where: { id: user.id },
				data: {
					...(email && { email: email.toLowerCase() }),
					...(username && { username: username.toLowerCase() }),
					updatedAt: Math.floor(Date.now() / 1000),
				},
			});

			return {
				user: {
					id: updatedUser.id,
					email: updatedUser.email,
					username: updatedUser.username,
					emailVerified: updatedUser.emailVerified,
					createdAt: updatedUser.createdAt,
					updatedAt: updatedUser.updatedAt,
				},
			};
		}),

	settings: os.use(dbWithAuth).handler(async ({ context }) => {
		const { db, user } = context;

		// Get user settings from database
		const userSettings = await db.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				username: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!userSettings) {
			throw new ORPCError("NOT_FOUND", { message: "User not found" });
		}

		return {
			id: userSettings.id,
			email: userSettings.email,
			username: userSettings.username,
			email_verified: userSettings.emailVerified,
			created_at: userSettings.createdAt,
			updated_at: userSettings.updatedAt,
		};
	}),

	updateSettings: os
		.use(dbWithAuth)
		.input(
			z.object({
				currentPassword: z.string().optional(),
				newPassword: z.string().min(8).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { currentPassword, newPassword } = input;
			const { db, user } = context;

			// If changing password, verify current password
			if (newPassword) {
				if (!currentPassword) {
					throw new ORPCError("BAD_REQUEST", { message: "Current password is required" });
				}

				const userWithPassword = await db.user.findUnique({
					where: { id: user.id },
					select: { passwordHash: true },
				});

				if (!userWithPassword) {
					throw new ORPCError("NOT_FOUND", { message: "User not found" });
				}

				const isValidPassword = await verifyPassword(
					currentPassword,
					userWithPassword.passwordHash || "",
				);
				if (!isValidPassword) {
					throw new ORPCError("UNAUTHORIZED", { message: "Invalid current password" });
				}

				// Hash new password
				const passwordHash = await hashPassword(newPassword);

				// Update password
				await db.user.update({
					where: { id: user.id },
					data: {
						passwordHash,
						updatedAt: Math.floor(Date.now() / 1000),
					},
				});
			}

			return {
				success: true,
				message: "Settings updated successfully",
			};
		}),
};
