import { ORPCError } from "@orpc/server";
import * as z from "zod";
import { os } from "~/server/orpc";
import { dbProvider } from "~/server/orpc/middleware/db";
import { hashPassword, verifyPassword } from "~/server/utils/crypto";
import { createJWT } from "~/server/utils/jwt";

export const authProcedures = {
	register: os
		.use(dbProvider)
		.input(
			z.object({
				username: z
					.string()
					.min(1)
					.regex(/^[a-zA-Z0-9_-]+$/),
				email: z.string().email(),
				password: z.string().min(8),
			}),
		)
		.handler(async ({ input, context }) => {
			const { username, email, password } = input;
			const { db } = context;
			const existingUser = await db.user.findFirst({
				where: {
					OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
				},
			});

			if (existingUser) {
				throw new ORPCError("CONFLICT", { message: "User already exists" });
			}

			const hashedPassword = await hashPassword(password);
			const { generateId } = await import("~/server/utils/crypto");
			const user = await db.user.create({
				data: {
					id: generateId(),
					username: username.toLowerCase(),
					email: email.toLowerCase(),
					passwordHash: hashedPassword,
					emailVerified: false,
				},
			});

			// Send verification email
			try {
				const { EmailVerificationService } = await import("~/server/services/emailVerification");
				const emailService = new EmailVerificationService(db, context.env);
				await emailService.sendVerificationEmail(user.id, user.email);
			} catch (error) {
				console.log("Email verification error:", error);
				// Continue without failing registration
				const delUser = await db.user.findUnique({
					where: { id: user.id },
					select: {
						id: true,
						username: true,
						email: true,
					},
				});
				if (delUser) {
					await db.user.delete({
						where: { id: user.id },
					});
				}

				return {
					success: false,
					message:
						"Registration failed to send verification email. Please contact support if you do not receive it.",
					user: {
						id: user.id,
						username: user.username,
						email: user.email,
					},
				};
			}

			return {
				success: true,
				message: "Registration successful. Please check your email to verify your account.",
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
				},
			};
		}),

	login: os
		.use(dbProvider)
		.input(
			z.object({
				email: z.string().email(),
				password: z.string(),
				rememberMe: z.boolean().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { email, password } = input;
			const { db, env } = context;

			try {
				const user = await db.user.findUnique({
					where: { email: email.toLowerCase() },
				});

				if (!user) {
					throw new ORPCError("UNAUTHORIZED", { message: "Invalid email or password" });
				}

				const isValidPassword = await verifyPassword(password, user.passwordHash);
				if (!isValidPassword) {
					throw new ORPCError("UNAUTHORIZED", { message: "Invalid email or password" });
				}

				const authUser = {
					id: user.id,
					email: user.email,
					username: user.username,
					emailVerified: user.emailVerified,
				};

				const token = await createJWT(
					{
						sub: authUser.id,
						email: authUser.email,
						username: authUser.username,
						emailVerified: authUser.emailVerified,
					},
					env,
				);

				return {
					accessToken: token,
					refreshToken: token, // TODO: Implement proper refresh token
					user: authUser,
					message: user.emailVerified ? undefined : "Please verify your email before logging in.",
				};
			} catch (error) {
				console.error("Login error:", error);
				if (error instanceof Error) {
					throw new ORPCError("BAD_REQUEST", { message: error.message });
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Login failed" });
			}
		}),

	refresh: os
		.use(dbProvider)
		.input(
			z.object({
				refreshToken: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { refreshToken } = input;
			const { db, env } = context;

			// TODO: Implement proper refresh token validation
			// For now, just decode the token to get user info
			const verifyJWT = (await import("~/server/utils/jwt")).verifyJWT;
			const payload = await verifyJWT(refreshToken, env);

			if (!payload || !payload.sub) {
				throw new ORPCError("UNAUTHORIZED", { message: "Invalid refresh token" });
			}

			const user = await db.user.findUnique({
				where: { id: payload.sub },
			});

			if (!user) {
				throw new ORPCError("UNAUTHORIZED", { message: "User not found" });
			}

			const authUser = {
				id: user.id,
				email: user.email,
				username: user.username,
				emailVerified: user.emailVerified,
			};

			const token = await createJWT(
				{
					sub: authUser.id,
					email: authUser.email,
					username: authUser.username,
					emailVerified: authUser.emailVerified,
				},
				env,
			);

			return { accessToken: token, refreshToken: token, user: authUser };
		}),

	verifyEmail: os
		.use(dbProvider)
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { token } = input;
			const { db } = context;

			const verificationToken = await db.emailVerification.findUnique({
				where: { token },
				include: { user: true },
			});

			if (!verificationToken || verificationToken.expiresAt < Date.now()) {
				throw new ORPCError("BAD_REQUEST", { message: "Invalid or expired verification token" });
			}

			await db.user.update({
				where: { id: verificationToken.user.id },
				data: { emailVerified: true },
			});

			await db.emailVerification.delete({
				where: { token },
			});

			return {
				success: true,
				message: "Email verified successfully. You can now log in.",
			};
		}),

	sendPasswordReset: os
		.use(dbProvider)
		.input(
			z.object({
				email: z.string().email(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { email } = input;
			const { db, env } = context;

			// Check if user exists
			const user = await db.user.findUnique({
				where: { email },
				select: { id: true },
			});

			// Always return success to prevent email enumeration
			if (user) {
				// Generate reset token
				const { generateId } = await import("~/server/utils/crypto");
				const resetToken = generateId();
				const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour
				const now = Math.floor(Date.now() / 1000);

				// Store reset token in database
				await db.passwordReset.create({
					data: {
						id: generateId(),
						userId: user.id,
						token: resetToken,
						expiresAt,
						createdAt: now,
					},
				});

				// Send password reset email
				const { EmailService } = await import("~/server/utils/email");
				const emailService = new EmailService(env);
				const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

				// Use default locale for now
				const userLocale = "ja";

				const emailTemplate = emailService.generatePasswordResetEmail({
					email,
					resetToken,
					resetUrl,
					userLocale,
				});

				await emailService.sendEmail(emailTemplate);
			}

			return {
				success: true,
				message: "If an account exists with this email, a password reset link has been sent.",
			};
		}),

	resetPassword: os
		.use(dbProvider)
		.input(
			z.object({
				token: z.string(),
				newPassword: z.string().min(8),
			}),
		)
		.handler(async ({ input, context }) => {
			const { token, newPassword } = input;
			const { db } = context;
			const now = Math.floor(Date.now() / 1000);

			// Find valid reset token
			const reset = await db.passwordReset.findFirst({
				where: {
					token,
					expiresAt: { gt: now },
					usedAt: null,
				},
				select: {
					id: true,
					userId: true,
				},
			});

			if (!reset) {
				throw new ORPCError("BAD_REQUEST", { message: "Invalid or expired token" });
			}

			// Hash new password
			const passwordHash = await hashPassword(newPassword);

			// Update password and mark token as used
			await db.user.update({
				where: { id: reset.userId },
				data: {
					passwordHash,
					updatedAt: now,
				},
			});

			try {
				// Mark token as used
				await db.passwordReset.update({
					where: { id: reset.id },
					data: {
						usedAt: now,
					},
				});
			} catch (_error) {
				// Ignore error if token cleanup fails
			}

			return {
				success: true,
				message: "Password reset successfully",
			};
		}),

	sendVerification: os
		.use(dbProvider)
		.input(
			z.object({
				email: z.string().email(),
				locale: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { email, locale } = input;
			const { db, env } = context;

			try {
				const { EmailVerificationService } = await import("~/server/services/emailVerification");
				const emailVerificationService = new EmailVerificationService(db, env);

				// Send verification email (returns true even if email doesn't exist for security)
				const sent = await emailVerificationService.resendVerificationEmail(email, locale);

				if (sent) {
					return {
						success: true,
						message:
							"If this email address exists and is not already verified, a verification email has been sent.",
					};
				}

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to send verification email. Please try again.",
				});
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Internal server error" });
			}
		}),

	logout: os
		.use(dbProvider)
		.input(
			z.object({
				refreshToken: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { refreshToken } = input;
			const { env } = context;

			try {
				// Verify refresh token
				const { verifyRefreshToken } = await import("~/server/utils/jwt");
				const userId = await verifyRefreshToken(refreshToken, env);
				if (!userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Invalid refresh token" });
				}

				// In a JWT-based system, logout is typically handled client-side
				// by removing the token. For simplicity, we'll just return success
				return {
					success: true,
					message: "Successfully logged out",
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Logout failed" });
			}
		}),
};
