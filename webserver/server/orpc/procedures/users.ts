import { ORPCError } from "@orpc/server";
import { UserPackingService } from "../../services/packing/UserPackingService";
import { UserService } from "../../services/UserService";
import { hashPassword, verifyPassword } from "../../utils/crypto";
import { authErrors } from "../../utils/i18n";
import type { Locale } from "../../utils/locale";
import { os } from "../index";
import { authRequiredMiddleware } from "../middleware/auth";
import { dbProvider } from "../middleware/db";
import { avatarUploadRateLimit } from "../middleware/rateLimit";

// Search users by username (for organization invitations)
export const searchByUsername = os.users.searchByUsername
	.use(dbProvider)
	.use(authRequiredMiddleware)
	.handler(async ({ input, context }) => {
		const { username, limit } = input;
		const { db, user } = context;
		const userService = new UserService(db);
		const userPackingService = new UserPackingService();

		// Search for users by username
		const users = await userService.searchUsersByUsername(username, limit);

		// Use UserPackingService to pack search results
		return userPackingService.packSearchUsers(users, user.id);
	});

// Get user profile by username
export const getProfile = os.users.getProfile
	.use(dbProvider)
	.use(authRequiredMiddleware)
	.handler(async ({ input, context }) => {
		const { username } = input;
		const { db, user, locale } = context;
		const userService = new UserService(db);
		const userPackingService = new UserPackingService();

		// Get user profile
		const targetUser = await userService.getUserByUsername(username);

		if (!targetUser) {
			throw new ORPCError("NOT_FOUND", {
				message: authErrors.userNotFound(locale as Locale),
			});
		}

		const recentRules = await db.rule.findMany({
			where: {
				userId: targetUser.id,
				visibility: "public",
			},
			select: {
				id: true,
				name: true,
				description: true,
				visibility: true,
				createdAt: true,
				updatedAt: true,
				organization: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
			take: 5,
		});

		// Fetch stats using UserService
		const stats = await userService.getUserStats(targetUser.id, {
			publicOnly: true,
		});

		// Use UserPackingService to pack user profile
		const userProfile = userPackingService.packUserProfile(targetUser, {
			currentUserId: user.id,
		});

		return {
			user: userProfile,
			stats,
			recentRules: recentRules.map((rule) => ({
				...rule,
				description: rule.description || "",
			})),
		};
	});

export const me = os.users.me
	.use(dbProvider)
	.use(authRequiredMiddleware)
	.handler(async ({ context }) => {
		const { db, user } = context;
		const userService = new UserService(db);
		const userPackingService = new UserPackingService();

		// Get detailed user profile from database
		const userProfile = await userService.getUserById(user.id);

		if (!userProfile) {
			throw new ORPCError("NOT_FOUND", { message: "User not found" });
		}

		// Fetch stats using UserService
		const stats = await userService.getUserStats(user.id, {
			includeTotalStars: true,
		});

		// Use UserPackingService to pack user with stats
		return userPackingService.packUserWithStats(userProfile, stats);
	});

export const updateProfile = os.users.updateProfile
	.use(dbProvider)
	.use(authRequiredMiddleware)
	.handler(async ({ input, context }) => {
		const { displayName, bio, location, website } = input;
		const { db, user } = context;
		const userPackingService = new UserPackingService();

		// Validate website URL if provided
		if (website && website !== "") {
			try {
				new URL(website);
			} catch {
				throw new ORPCError("BAD_REQUEST", { message: "Invalid website URL" });
			}
		}

		// Update user profile
		const updatedUser = await db.user.update({
			where: { id: user.id },
			data: {
				...(displayName !== undefined && { displayName }),
				...(bio !== undefined && { bio }),
				...(location !== undefined && { location }),
				...(website !== undefined && { website: website || null }),
				updatedAt: Math.floor(Date.now() / 1000),
			},
		});

		return {
			user: userPackingService.packFullUserProfile(updatedUser),
		};
	});

export const changePassword = os.users.changePassword
	.use(dbProvider)
	.use(authRequiredMiddleware)
	.handler(async ({ input, context }) => {
		const { currentPassword, newPassword } = input;
		const { db, user, locale } = context;

		// Get user with password hash
		const dbUser = await db.user.findUnique({
			where: { id: user.id },
			select: { passwordHash: true },
		});

		if (!dbUser || !dbUser.passwordHash) {
			throw new ORPCError("BAD_REQUEST", {
				message: authErrors.passwordChangeNotAvailable(locale as Locale),
			});
		}

		// Verify current password
		const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
		if (!isValid) {
			throw new ORPCError("UNAUTHORIZED", {
				message: authErrors.invalidCurrentPassword(locale as Locale),
			});
		}

		// Hash and update new password
		const newPasswordHash = await hashPassword(newPassword);
		await db.user.update({
			where: { id: user.id },
			data: {
				passwordHash: newPasswordHash,
				updatedAt: Math.floor(Date.now() / 1000),
			},
		});

		return { success: true };
	});

export const settings = os.users.settings
	.use(dbProvider)
	.use(authRequiredMiddleware)
	.handler(async ({ context }) => {
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
	});

export const updateSettings = os.users.updateSettings
	.use(dbProvider)
	.use(authRequiredMiddleware)
	.handler(async ({ input, context }) => {
		const { currentPassword, newPassword } = input;
		const { db, user, locale } = context;

		// If changing password, verify current password
		if (newPassword) {
			if (!currentPassword) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Current password is required",
				});
			}

			const userWithPassword = await db.user.findUnique({
				where: { id: user.id },
				select: { passwordHash: true },
			});

			if (!userWithPassword) {
				throw new ORPCError("NOT_FOUND", {
					message: authErrors.userNotFound(locale as Locale),
				});
			}

			const isValidPassword = await verifyPassword(
				currentPassword,
				userWithPassword.passwordHash || "",
			);
			if (!isValidPassword) {
				throw new ORPCError("UNAUTHORIZED", {
					message: "Invalid current password",
				});
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
	});

export const uploadAvatar = os.users.uploadAvatar
	.use(avatarUploadRateLimit)
	.handler(async ({ input, context }) => {
		const { image, filename } = input;
		const { db, env } = context;

		// Ensure user is authenticated
		if (!context.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "Authentication required",
			});
		}
		const user = context.user;

		try {
			// Decode base64 image using Uint8Array (Cloudflare Workers compatible)
			const binaryString = atob(image);
			const imageData = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				imageData[i] = binaryString.charCodeAt(i);
			}

			// Validate image size (max 5MB)
			if (imageData.length > 5 * 1024 * 1024) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Image size must be less than 5MB",
				});
			}

			// Validate image format (simple check by filename extension)
			const ext = filename.toLowerCase().split(".").pop();
			if (!ext || !["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Unsupported image format. Use JPG, PNG, GIF, or WebP",
				});
			}

			// Generate unique filename
			const { nanoid } = await import("nanoid");
			const avatarKey = `avatars/${user.id}/${nanoid()}.${ext}`;

			// Upload to R2
			if (!env.R2) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Storage not available",
				});
			}

			await env.R2.put(avatarKey, imageData, {
				httpMetadata: {
					contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
				},
			});

			// Update user avatar URL
			const updatedUser = await db.user.update({
				where: { id: user.id },
				data: {
					avatarUrl: avatarKey,
					updatedAt: Math.floor(Date.now() / 1000),
				},
				select: {
					avatarUrl: true,
				},
			});

			return {
				avatarUrl: updatedUser.avatarUrl || "",
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to upload avatar",
			});
		}
	});

export const deleteAccount = os.users.deleteAccount
	.use(dbProvider)
	.use(authRequiredMiddleware)
	.handler(async ({ input, context }) => {
		const { password, confirmation } = input;
		const { db, user, locale } = context;

		// Verify confirmation text
		if (confirmation !== "DELETE") {
			throw new ORPCError("BAD_REQUEST", { message: "Invalid confirmation" });
		}

		// Get user with password hash and organization memberships
		const dbUser = await db.user.findUnique({
			where: { id: user.id },
			select: {
				passwordHash: true,
				organizationMembers: {
					where: { role: "owner" },
					include: { organization: true },
				},
			},
		});

		if (!dbUser) {
			throw new ORPCError("NOT_FOUND", {
				message: authErrors.userNotFound(locale as Locale),
			});
		}

		// Verify password
		if (dbUser.passwordHash) {
			const isValid = await verifyPassword(password, dbUser.passwordHash);
			if (!isValid) {
				throw new ORPCError("UNAUTHORIZED", { message: "Invalid password" });
			}
		} else {
			// OAuth users might not have a password
			throw new ORPCError("BAD_REQUEST", {
				message: "Please use your OAuth provider to delete your account",
			});
		}

		// Check if user is the only owner of any organizations
		if (dbUser.organizationMembers.length > 0) {
			for (const membership of dbUser.organizationMembers) {
				const ownerCount = await db.organizationMember.count({
					where: {
						organizationId: membership.organizationId,
						role: "owner",
					},
				});

				if (ownerCount <= 1) {
					throw new ORPCError("BAD_REQUEST", {
						message:
							"You must transfer ownership of your organizations before deleting your account",
					});
				}
			}
		}

		// Delete user account (cascade will handle related records)
		await db.user.delete({
			where: { id: user.id },
		});

		return {
			success: true,
			message: "Account deleted successfully",
		};
	});

// Get public user profile
export const getPublicProfile = os.users.getPublicProfile
	.use(dbProvider)
	.handler(async ({ input, context }) => {
		const { username } = input;
		const { db } = context;
		const userService = new UserService(db);
		const userPackingService = new UserPackingService();

		// Get user profile
		const user = await userService.getUserByUsername(username);

		if (!user) {
			throw new ORPCError("NOT_FOUND", { message: "User not found" });
		}

		// Get public stats using UserService
		const stats = await userService.getUserStats(user.id, {
			publicOnly: true,
			includeTotalStars: true,
		});

		// Get public rules with star count
		const publicRules = await db.rule.findMany({
			where: {
				userId: user.id,
				visibility: "public",
			},
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true,
				organization: {
					select: {
						name: true,
					},
				},
				starredBy: {
					select: {
						id: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
			take: 20,
		});

		return {
			user: userPackingService.packPublicProfile(user),
			stats: {
				publicRulesCount: stats.rulesCount,
				totalStars: stats.totalStars || 0,
			},
			publicRules: publicRules.map((rule) => ({
				id: rule.id,
				name: rule.name,
				description: rule.description || "",
				stars: rule.starredBy.length,
				createdAt: rule.createdAt,
				updatedAt: rule.updatedAt,
				organization: rule.organization,
			})),
		};
	});

export const usersProcedures = {
	searchByUsername,
	getProfile,
	me,
	updateProfile,
	changePassword,
	settings,
	updateSettings,
	uploadAvatar,
	deleteAccount,
	getPublicProfile,
};
