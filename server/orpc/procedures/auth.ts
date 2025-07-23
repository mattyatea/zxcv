import { ORPCError } from "@orpc/server";
import * as z from "zod";
import { os } from "~/server/orpc";
import { dbProvider } from "~/server/orpc/middleware/db";
import { hashPassword, verifyPassword } from "~/server/utils/crypto";
import { createJWT } from "~/server/utils/jwt";
import { checkNamespaceAvailable } from "~/server/utils/namespace";
import { createOAuthProviders, generateCodeVerifier, generateState } from "~/server/utils/oauth";

export const authProcedures = {
	register: os
		.use(dbProvider)
		.route({
			method: "POST",
			path: "/auth/register",
			description: "Register a new user account",
		})
		.input(
			z.object({
				username: z
					.string()
					.min(1)
					.regex(/^[a-zA-Z0-9_-]+$/)
					.describe("Username (alphanumeric, underscores, and hyphens only)"),
				email: z.string().email().describe("User email address"),
				password: z.string().min(8).describe("Password (minimum 8 characters)"),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				message: z.string(),
				user: z.object({
					id: z.string(),
					username: z.string(),
					email: z.string(),
				}),
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

			// Check if username is available (not taken by user or organization)
			const isAvailable = await checkNamespaceAvailable(db, username.toLowerCase());
			if (!isAvailable) {
				throw new ORPCError("CONFLICT", {
					message: "Username is already taken",
				});
			}

			const hashedPassword = await hashPassword(password);
			const { generateId } = await import("~/server/utils/crypto");
			const userId = generateId();

			const user = await db.user.create({
				data: {
					id: userId,
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
		.route({
			method: "POST",
			path: "/auth/login",
			description: "Login with email and password",
		})
		.input(
			z.object({
				email: z.string().email().describe("User email address"),
				password: z.string().describe("User password"),
				rememberMe: z.boolean().optional().describe("Remember login session"),
			}),
		)
		.output(
			z.object({
				accessToken: z.string(),
				refreshToken: z.string(),
				user: z.object({
					id: z.string(),
					email: z.string(),
					username: z.string(),
					emailVerified: z.boolean(),
				}),
				message: z.string().optional(),
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

				if (!user.passwordHash) {
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

				const { createRefreshToken } = await import("~/server/utils/jwt");
				const accessToken = await createJWT(
					{
						sub: authUser.id,
						email: authUser.email,
						username: authUser.username,
						emailVerified: authUser.emailVerified,
					},
					env,
				);
				const refreshToken = await createRefreshToken(authUser.id, env);

				return {
					accessToken,
					refreshToken,
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
		.route({
			method: "POST",
			path: "/auth/refresh",
			description: "Refresh access token",
		})
		.input(
			z.object({
				refreshToken: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { refreshToken } = input;
			const { db, env } = context;

			// Verify refresh token
			const { verifyRefreshToken, createRefreshToken } = await import("~/server/utils/jwt");
			const userId = await verifyRefreshToken(refreshToken, env);

			if (!userId) {
				throw new ORPCError("UNAUTHORIZED", { message: "Invalid refresh token" });
			}

			const user = await db.user.findUnique({
				where: { id: userId },
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

			const accessToken = await createJWT(
				{
					sub: authUser.id,
					email: authUser.email,
					username: authUser.username,
					emailVerified: authUser.emailVerified,
				},
				env,
			);
			const newRefreshToken = await createRefreshToken(authUser.id, env);

			return { accessToken, refreshToken: newRefreshToken, user: authUser };
		}),

	verifyEmail: os
		.use(dbProvider)
		.route({
			method: "POST",
			path: "/auth/verifyEmail",
			description: "Verify email address",
		})
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { token } = input;
			const { db, env } = context;
			const { EmailVerificationService } = await import("~/server/services/emailVerification");

			const emailVerificationService = new EmailVerificationService(db, env);
			const result = await emailVerificationService.verifyEmail(token);

			if (!result.success) {
				throw new ORPCError("BAD_REQUEST", {
					message: result.message || "Invalid or expired verification token",
				});
			}

			return {
				success: true,
				message: "Email verified successfully. You can now log in.",
			};
		}),

	sendPasswordReset: os
		.use(dbProvider)
		.route({
			method: "POST",
			path: "/auth/sendPasswordReset",
			description: "Send password reset email",
		})
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
		.route({
			method: "POST",
			path: "/auth/resetPassword",
			description: "Reset password with token",
		})
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
		.route({
			method: "POST",
			path: "/auth/sendVerification",
			description: "Resend verification email",
		})
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
		.route({
			method: "POST",
			path: "/auth/logout",
			description: "Logout user",
		})
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

	// OAuth initialization endpoints
	oauthInitialize: os
		.use(dbProvider)
		.route({
			method: "POST",
			path: "/auth/oauthInitialize",
			description: "Initialize OAuth flow",
		})
		.input(
			z.object({
				provider: z.enum(["google", "github"]),
				redirectUrl: z.string().optional(),
				action: z.enum(["login", "register"]).optional().default("login"),
			}),
		)
		.handler(async ({ input, context }) => {
			const { provider, redirectUrl, action } = input;
			const { db, env } = context;
			const providers = createOAuthProviders(env);

			// Generate state for CSRF protection with action encoded
			const stateData = {
				random: generateState(),
				action,
			};
			const state = Buffer.from(JSON.stringify(stateData)).toString("base64url");
			const codeVerifier = provider === "google" ? generateCodeVerifier() : undefined;

			// Store state in database
			const { generateId } = await import("~/server/utils/crypto");
			const expiresAt = Math.floor(Date.now() / 1000) + 600; // 10 minutes

			await db.oAuthState.create({
				data: {
					id: generateId(),
					state: stateData.random, // Store the random part, not the encoded state
					provider,
					codeVerifier,
					redirectUrl: redirectUrl || "/",
					expiresAt,
				},
			});

			// Generate authorization URL
			let authorizationUrl: string;
			if (provider === "google") {
				const url = providers.google.createAuthorizationURL(state, codeVerifier || "", [
					"openid",
					"email",
					"profile",
				]);
				url.searchParams.set("access_type", "offline");
				authorizationUrl = url.toString();
			} else {
				const url = providers.github.createAuthorizationURL(state, ["user:email"]);
				authorizationUrl = url.toString();
			}

			return {
				authorizationUrl,
			};
		}),

	// OAuth callback handler
	oauthCallback: os
		.use(dbProvider)
		.route({
			method: "POST",
			path: "/auth/oauthCallback",
			description: "Handle OAuth callback",
		})
		.input(
			z.object({
				provider: z.enum(["google", "github"]),
				code: z.string(),
				state: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { provider, code, state } = input;
			const { db, env } = context;

			console.log("OAuth callback started:", {
				provider,
				code: `${code?.substring(0, 10)}...`,
				state,
			});

			const providers = createOAuthProviders(env);

			// Decode state to extract action
			let stateData: { random: string; action: string };
			try {
				stateData = JSON.parse(Buffer.from(state, "base64url").toString());
			} catch (e) {
				console.error("Failed to decode state:", e);
				throw new ORPCError("BAD_REQUEST", { message: "Invalid state format" });
			}

			// Verify state
			const stateRecord = await db.oAuthState.findUnique({
				where: { state: stateData.random },
			});

			console.log("State record found:", stateRecord);
			console.log("Action from state:", stateData.action);

			if (
				!stateRecord ||
				stateRecord.provider !== provider ||
				stateRecord.expiresAt < Math.floor(Date.now() / 1000)
			) {
				console.error("State validation failed:", {
					stateRecord,
					provider,
					currentTime: Math.floor(Date.now() / 1000),
				});
				throw new ORPCError("BAD_REQUEST", { message: "Invalid or expired state" });
			}

			// Clean up state
			await db.oAuthState.delete({ where: { id: stateRecord.id } });

			try {
				let tokens: { accessToken: () => string };
				let userInfo: { id: string; email: string; username?: string };

				if (provider === "google") {
					if (!stateRecord.codeVerifier) {
						throw new ORPCError("BAD_REQUEST", { message: "Missing code verifier" });
					}
					tokens = await providers.google.validateAuthorizationCode(code, stateRecord.codeVerifier);

					// Fetch user info from Google
					const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
						headers: {
							Authorization: `Bearer ${tokens.accessToken()}`,
						},
					});

					if (!response.ok) {
						throw new ORPCError("INTERNAL_SERVER_ERROR", {
							message: "Failed to fetch user info from Google",
						});
					}

					const googleUser = (await response.json()) as {
						id: string;
						email: string;
						name?: string;
					};
					userInfo = {
						id: googleUser.id,
						email: googleUser.email,
						username: googleUser.email.split("@")[0],
					};
				} else {
					console.log("Validating GitHub authorization code...");
					tokens = await providers.github.validateAuthorizationCode(code);
					console.log("GitHub token obtained");

					// Fetch user info from GitHub
					const [userResponse, emailResponse] = await Promise.all([
						fetch("https://api.github.com/user", {
							headers: {
								Authorization: `Bearer ${tokens.accessToken()}`,
								"User-Agent": "zxcv-app",
							},
						}),
						fetch("https://api.github.com/user/emails", {
							headers: {
								Authorization: `Bearer ${tokens.accessToken()}`,
								"User-Agent": "zxcv-app",
							},
						}),
					]);

					console.log("GitHub API responses:", {
						userStatus: userResponse.status,
						emailStatus: emailResponse.status,
					});

					if (!userResponse.ok || !emailResponse.ok) {
						console.error("GitHub API error:", {
							userStatus: userResponse.status,
							userText: await userResponse.text(),
							emailStatus: emailResponse.status,
							emailText: await emailResponse.text(),
						});
						throw new ORPCError("INTERNAL_SERVER_ERROR", {
							message: "Failed to fetch user info from GitHub",
						});
					}

					const githubUser = (await userResponse.json()) as {
						id: number;
						login: string;
						name?: string;
					};
					const emails = (await emailResponse.json()) as Array<{
						email: string;
						primary: boolean;
						verified: boolean;
					}>;
					const primaryEmail = emails.find((e) => e.primary)?.email || emails[0]?.email;

					if (!primaryEmail) {
						throw new ORPCError("BAD_REQUEST", {
							message: "No email address found in GitHub account",
						});
					}

					userInfo = {
						id: githubUser.id.toString(),
						email: primaryEmail,
						username: githubUser.login,
					};
				}

				// Check if OAuth account already exists
				const existingOAuth = await db.oAuthAccount.findUnique({
					where: {
						// biome-ignore lint/style/useNamingConvention: Prisma composite key format
						provider_providerId: {
							provider,
							providerId: userInfo.id,
						},
					},
					include: { user: true },
				});

				// biome-ignore lint/suspicious/noExplicitAny: User type varies based on OAuth provider
				let user: any;
				if (existingOAuth) {
					// User already linked this OAuth account
					user = existingOAuth.user;
				} else {
					// Check if user with this email already exists
					const existingUser = await db.user.findUnique({
						where: { email: userInfo.email.toLowerCase() },
					});

					if (existingUser) {
						// Link OAuth account to existing user
						const { generateId } = await import("~/server/utils/crypto");
						await db.oAuthAccount.create({
							data: {
								id: generateId(),
								userId: existingUser.id,
								provider,
								providerId: userInfo.id,
								email: userInfo.email,
								username: userInfo.username,
							},
						});
						user = existingUser;
					} else {
						// Create new user with OAuth
						const { generateId } = await import("~/server/utils/crypto");

						// Generate unique username if needed
						let username = (userInfo.username || userInfo.email.split("@")[0]).toLowerCase();
						let usernameCounter = 0;
						while (await db.user.findUnique({ where: { username } })) {
							usernameCounter++;
							username = `${(userInfo.username || userInfo.email.split("@")[0]).toLowerCase()}${usernameCounter}`;
						}

						user = await db.user.create({
							data: {
								id: generateId(),
								email: userInfo.email.toLowerCase(),
								username,
								passwordHash: null, // OAuth users don't have passwords
								emailVerified: true, // OAuth providers verify emails
								oauthAccounts: {
									create: {
										id: generateId(),
										provider,
										providerId: userInfo.id,
										email: userInfo.email,
										username: userInfo.username,
									},
								},
							},
						});
					}
				}

				// Generate JWT tokens
				const { createRefreshToken } = await import("~/server/utils/jwt");
				const accessToken = await createJWT(
					{
						sub: user.id,
						email: user.email,
						username: user.username,
						emailVerified: user.emailVerified,
					},
					env,
				);
				const refreshToken = await createRefreshToken(user.id, env);

				return {
					accessToken,
					refreshToken,
					user: {
						id: user.id,
						email: user.email,
						username: user.username,
						emailVerified: user.emailVerified,
					},
					redirectUrl: stateRecord.redirectUrl || "/",
				};
			} catch (error) {
				console.error("OAuth callback error:", error);
				if (error instanceof ORPCError) {
					throw error;
				}

				// Provide more detailed error information for debugging
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				console.error("Detailed error:", {
					message: errorMessage,
					stack: error instanceof Error ? error.stack : undefined,
					error: error,
				});

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: `OAuth authentication failed: ${errorMessage}`,
				});
			}
		}),
};
