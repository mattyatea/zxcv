import { ORPCError } from "@orpc/server";
import { os } from "~/server/orpc";
import { dbProvider, dbWithAuth } from "~/server/orpc/middleware/combined";
import { hashPassword, verifyPassword } from "~/server/utils/crypto";
import { authErrors, type Locale } from "~/server/utils/i18n";

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

		return users;
	});

// Get user profile by username
export const getProfile = os.users.getProfile
	.use(dbProvider)
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

		return {
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				emailVerified: user.emailVerified,
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

export const profile = os.users.profile.use(dbWithAuth).handler(async ({ context }) => {
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
});

export const updateProfile = os.users.updateProfile
	.use(dbWithAuth)
	.handler(async ({ input, context }) => {
		const { email, username } = input;
		const { db, user } = context;

		// Check if email or username already exist
		// Use separate queries for better index utilization
		if (email) {
			const existingUserByEmail = await db.user.findFirst({
				where: {
					email: email.toLowerCase(),
					id: { not: user.id },
				},
			});

			if (existingUserByEmail) {
				const locale: Locale = "ja"; // Default to Japanese
				throw new ORPCError("CONFLICT", { message: authErrors.emailAlreadyInUse(locale) });
			}
		}

		if (username) {
			const existingUserByUsername = await db.user.findFirst({
				where: {
					username: username.toLowerCase(),
					id: { not: user.id },
				},
			});

			if (existingUserByUsername) {
				const locale: Locale = "ja"; // Default to Japanese
				throw new ORPCError("CONFLICT", { message: authErrors.usernameAlreadyInUse(locale) });
			}
		}

		// Update user profile
		const updatedUser = await db.user.update({
			where: { id: user.id },
			data: {
				...(email && {
					email: email.toLowerCase(),
					emailVerified: false, // Reset email verification when email changes
				}),
				...(username && { username: username.toLowerCase() }),
				updatedAt: Math.floor(Date.now() / 1000),
			},
		});

		// If email changed, send verification email
		if (email && email.toLowerCase() !== user.email.toLowerCase()) {
			const { EmailVerificationService } = await import("~/server/services/emailVerification");
			const emailService = new EmailVerificationService(db, context.env);
			await emailService.sendVerificationEmail(user.id, email.toLowerCase());
		}

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
		const { verifyPassword, hashPassword } = await import("~/server/utils/crypto");
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

export const usersProcedures = {
	searchByUsername,
	getProfile,
	profile,
	updateProfile,
	changePassword,
	settings,
	updateSettings,
	deleteAccount,
};
