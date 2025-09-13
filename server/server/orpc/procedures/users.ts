import { ORPCError } from "@orpc/server";
import { hashPassword, verifyPassword } from "../../utils/crypto";
import { authErrors, type Locale } from "../../utils/i18n";
import { os } from "../index";
import { dbWithAuth } from "../middleware/combined";
import { dbProvider } from "../middleware/db";

// Search users by username (for organization invitations)
export const searchByUsername = os.users.searchByUsername
	.use(dbWithAuth)
	.handler(async ({ input, context }) => {
		const { username, limit } = input;
		const { db } = context;

		// Search for users by username (case-insensitive partial match)
		const users = await db.user.findMany({
			where: {
				username: {
					contains: username.toLowerCase(),
				},
			},
			select: {
				id: true,
				username: true,
				email: true,
			},
			take: limit,
			orderBy: {
				username: "asc",
			},
		});

		// Mask email addresses for other users
		return users.map((u) => ({
			...u,
			email: u.id === context.user.id ? u.email : null,
		}));
	});

// Get user profile by username
export const getProfile = os.users.getProfile
	.use(dbWithAuth)
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
				displayName: true,
				bio: true,
				location: true,
				website: true,
				avatarUrl: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			const locale: Locale = "ja"; // Default to Japanese
			throw new ORPCError("NOT_FOUND", { message: authErrors.userNotFound(locale) });
		}

		// Get user statistics
		const [rulesCount, organizationsCount] = await Promise.all([
			db.rule.count({
				where: {
					userId: user.id,
					visibility: "public", // Only count public rules
				},
			}),
			db.organizationMember.count({
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

		// Check if the requesting user is viewing their own profile
		const isOwnProfile = context.user?.id === user.id;

		return {
			user: {
				id: user.id,
				username: user.username,
				email: isOwnProfile ? user.email : null,
				emailVerified: user.emailVerified,
				displayName: user.displayName,
				bio: user.bio,
				location: user.location,
				website: user.website,
				avatarUrl: user.avatarUrl,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
			stats: {
				rulesCount,
				organizationsCount,
			},
			recentRules: recentRules.map((rule) => ({
				...rule,
				description: rule.description || "",
			})),
		};
	});

export const me = os.users.me.use(dbWithAuth).handler(async ({ context }) => {
	const { db, user } = context;

	// Get detailed user profile from database
	const userProfile = await db.user.findUnique({
		where: { id: user.id },
		select: {
			id: true,
			email: true,
			username: true,
			emailVerified: true,
			displayName: true,
			bio: true,
			location: true,
			website: true,
			avatarUrl: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!userProfile) {
		throw new ORPCError("NOT_FOUND", { message: "User not found" });
	}

	// Get user statistics
	const [rulesCount, organizationsCount, totalStars] = await Promise.all([
		db.rule.count({
			where: {
				userId: user.id,
			},
		}),
		db.organizationMember.count({
			where: {
				userId: user.id,
			},
		}),
		db.ruleStar.count({
			where: {
				rule: {
					userId: user.id,
				},
			},
		}),
	]);

	return {
		id: userProfile.id,
		email: userProfile.email,
		username: userProfile.username,
		emailVerified: userProfile.emailVerified,
		displayName: userProfile.displayName,
		bio: userProfile.bio,
		location: userProfile.location,
		website: userProfile.website,
		avatarUrl: userProfile.avatarUrl,
		createdAt: userProfile.createdAt,
		updatedAt: userProfile.updatedAt,
		stats: {
			rulesCount,
			organizationsCount,
			totalStars,
		},
	};
});

export const updateProfile = os.users.updateProfile
	.use(dbWithAuth)
	.handler(async ({ input, context }) => {
		const { displayName, bio, location, website } = input;
		const { db, user } = context;

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
			select: {
				id: true,
				email: true,
				username: true,
				emailVerified: true,
				displayName: true,
				bio: true,
				location: true,
				website: true,
				avatarUrl: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return {
			user: updatedUser,
		};
	});

export const changePassword = os.users.changePassword
	.use(dbWithAuth)
	.handler(async ({ input, context }) => {
		const { currentPassword, newPassword } = input;
		const { db, user } = context;

		// Get user with password hash
		const dbUser = await db.user.findUnique({
			where: { id: user.id },
			select: { passwordHash: true },
		});

		if (!dbUser || !dbUser.passwordHash) {
			const locale: Locale = "ja"; // Default to Japanese
			throw new ORPCError("BAD_REQUEST", {
				message: authErrors.passwordChangeNotAvailable(locale),
			});
		}

		// Verify current password
		const { verifyPassword, hashPassword } = await import("../../utils/crypto");
		const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
		if (!isValid) {
			const locale: Locale = "ja"; // Default to Japanese
			throw new ORPCError("UNAUTHORIZED", {
				message: authErrors.invalidCurrentPassword(locale),
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

export const settings = os.users.settings.use(dbWithAuth).handler(async ({ context }) => {
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
	.use(dbWithAuth)
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
				const locale: Locale = "ja"; // Default to Japanese
				throw new ORPCError("NOT_FOUND", { message: authErrors.userNotFound(locale) });
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
	});

export const uploadAvatar = os.users.uploadAvatar
	.use(dbWithAuth)
	.handler(async ({ input, context }) => {
		const { image, filename } = input;
		const { db, user, env } = context;

		console.log("Avatar upload started:", {
			userId: user.id,
			filename,
			base64Length: image.length,
		});

		try {
			// Decode base64 image
			const imageData = Buffer.from(image, "base64");
			console.log("Image decoded, buffer length:", imageData.length);

			// Validate image size (max 5MB)
			if (imageData.length > 5 * 1024 * 1024) {
				throw new ORPCError("BAD_REQUEST", { message: "Image size must be less than 5MB" });
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
			console.log("Generated avatar key:", avatarKey);

			// Upload to R2
			if (!env.R2) {
				console.error("R2 storage not available");
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Storage not available" });
			}

			console.log("Uploading to R2...");
			await env.R2.put(avatarKey, imageData, {
				httpMetadata: {
					contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
				},
			});
			console.log("R2 upload completed");

			// Update user avatar URL
			console.log("Updating user avatar URL in database...");
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
			console.log("Database update completed");

			return {
				avatarUrl: updatedUser.avatarUrl || "",
			};
		} catch (error) {
			console.error("Avatar upload error:", error);
			if (error instanceof ORPCError) {
				throw error;
			}
			throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to upload avatar" });
		}
	});

export const deleteAccount = os.users.deleteAccount
	.use(dbWithAuth)
	.handler(async ({ input, context }) => {
		const { password, confirmation } = input;
		const { db, user } = context;

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
			const locale: Locale = "ja"; // Default to Japanese
			throw new ORPCError("NOT_FOUND", { message: authErrors.userNotFound(locale) });
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

		// Get user profile
		const user = await db.user.findUnique({
			where: { username: username.toLowerCase() },
			select: {
				id: true,
				username: true,
				displayName: true,
				bio: true,
				location: true,
				website: true,
				avatarUrl: true,
				createdAt: true,
			},
		});

		if (!user) {
			throw new ORPCError("NOT_FOUND", { message: "User not found" });
		}

		// Get public rules count and total stars
		const [publicRulesCount, totalStars] = await Promise.all([
			db.rule.count({
				where: {
					userId: user.id,
					visibility: "public",
				},
			}),
			db.ruleStar.count({
				where: {
					rule: {
						userId: user.id,
						visibility: "public",
					},
				},
			}),
		]);

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
			user: {
				id: user.id,
				username: user.username,
				displayName: user.displayName,
				bio: user.bio,
				location: user.location,
				website: user.website,
				avatarUrl: user.avatarUrl,
				createdAt: user.createdAt,
			},
			stats: {
				publicRulesCount,
				totalStars,
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
