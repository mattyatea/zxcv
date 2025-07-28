import { ORPCError } from "@orpc/server";
import { os } from "~/server/orpc";
import { dbProvider } from "~/server/orpc/middleware/db";
import {
	authRateLimit,
	passwordResetRateLimit,
	registerRateLimit,
} from "~/server/orpc/middleware/rateLimit";
import { hashPassword, verifyPassword } from "~/server/utils/crypto";
import { authErrors, type Locale } from "~/server/utils/i18n";
import { createJWT } from "~/server/utils/jwt";
import { getLocaleFromRequest } from "~/server/utils/locale";
import {
	createOAuthProviders,
	generateCodeVerifier,
	generateState,
	safeCompare,
} from "~/server/utils/oauth";

export const register = os.auth.register
	.use(registerRateLimit)
	.handler(async ({ input, context }) => {
		const { username, email, password } = input;
		const { db, cloudflare } = context;
		// Get user locale from request headers
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		// Check for existing user by email first (more likely to have index)
		const existingUserByEmail = await db.user.findUnique({
			where: { email: email.toLowerCase() },
		});

		if (existingUserByEmail) {
			throw new ORPCError("CONFLICT", { message: authErrors.userExists(locale) });
		}

		// Then check by username
		const existingUserByUsername = await db.user.findUnique({
			where: { username: username.toLowerCase() },
		});

		if (existingUserByUsername) {
			throw new ORPCError("CONFLICT", { message: authErrors.usernameExists(locale) });
		}

		// Check if username is available (not taken by organization)
		const organizationExists = await db.organization.findUnique({
			where: { name: username.toLowerCase() },
		});

		if (organizationExists) {
			throw new ORPCError("CONFLICT", {
				message: authErrors.usernameNotAvailable(locale),
			});
		}

		// Hash password and generate user ID
		const hashedPassword = await hashPassword(password);
		const { generateId } = await import("~/server/utils/crypto");
		const userId = generateId();

		let user: Awaited<ReturnType<typeof db.user.create>>;
		try {
			// Create user
			user = await db.user.create({
				data: {
					id: userId,
					username: username.toLowerCase(),
					email: email.toLowerCase(),
					passwordHash: hashedPassword,
					emailVerified: false,
				},
			});
		} catch (error) {
			console.error("User creation error:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: authErrors.registrationFailed(locale),
			});
		}

		// Send verification email
		try {
			const { EmailVerificationService } = await import("~/server/services/emailVerification");
			const emailService = new EmailVerificationService(db, context.env);
			await emailService.sendVerificationEmail(user.id, user.email);
		} catch (error) {
			console.error("Email verification error:", error);
			// Email sending failed, but user is created - delete the user
			if (user?.id) {
				try {
					await db.user.delete({
						where: { id: user.id },
					});
				} catch (deleteError) {
					console.error("Failed to delete user after email error:", deleteError);
				}
			}
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: authErrors.registrationFailedEmail(locale),
			});
		}

		return {
			success: true,
			message: authErrors.registrationSuccess(locale),
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
			},
		};
	});

export const login = os.auth.login.use(authRateLimit).handler(async ({ input, context }) => {
	const { email, password } = input;
	const { db, env, cloudflare } = context;
	// Get user locale from request headers
	const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

	try {
		const user = await db.user.findUnique({
			where: { email: email.toLowerCase() },
		});

		if (!user) {
			throw new ORPCError("UNAUTHORIZED", { message: authErrors.invalidCredentials(locale) });
		}

		if (!user.passwordHash) {
			throw new ORPCError("UNAUTHORIZED", { message: authErrors.invalidCredentials(locale) });
		}
		const isValidPassword = await verifyPassword(password, user.passwordHash);
		if (!isValidPassword) {
			throw new ORPCError("UNAUTHORIZED", { message: authErrors.invalidCredentials(locale) });
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
			message: user.emailVerified ? undefined : authErrors.emailNotVerified(locale),
		};
	} catch (error) {
		console.error("Login error:", error);
		if (error instanceof ORPCError) {
			throw error;
		}
		throw new ORPCError("INTERNAL_SERVER_ERROR", { message: authErrors.loginFailed(locale) });
	}
});

export const refresh = os.auth.refresh.use(dbProvider).handler(async ({ input, context }) => {
	const { refreshToken } = input;
	const { db, env, cloudflare } = context;
	// Get user locale from request headers
	const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

	// Verify refresh token
	const { verifyRefreshToken, createRefreshToken } = await import("~/server/utils/jwt");
	const userId = await verifyRefreshToken(refreshToken, env);

	if (!userId) {
		throw new ORPCError("UNAUTHORIZED", { message: authErrors.invalidToken(locale) });
	}

	const user = await db.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new ORPCError("UNAUTHORIZED", { message: authErrors.userNotFound(locale) });
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
});

export const verifyEmail = os.auth.verifyEmail
	.use(dbProvider)
	.handler(async ({ input, context }) => {
		const { token } = input;
		const { db, env, cloudflare } = context;
		// Get user locale from request headers
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;
		const { EmailVerificationService } = await import("~/server/services/emailVerification");

		const emailVerificationService = new EmailVerificationService(db, env);
		const result = await emailVerificationService.verifyEmail(token);

		if (!result.success) {
			throw new ORPCError("BAD_REQUEST", {
				message: result.message || authErrors.invalidToken(locale),
			});
		}

		return {
			success: true,
			message: authErrors.emailVerificationSuccess(locale),
		};
	});

export const sendPasswordReset = os.auth.sendPasswordReset
	.use(passwordResetRateLimit)
	.handler(async ({ input, context }) => {
		const { email } = input;
		const { db, env, cloudflare } = context;
		// Get user locale from request headers
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

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
			message: authErrors.passwordResetEmailSent(locale),
		};
	});

export const resetPassword = os.auth.resetPassword
	.use(dbProvider)
	.handler(async ({ input, context }) => {
		const { token, newPassword } = input;
		const { db, cloudflare } = context;
		// Get user locale from request headers
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;
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
			throw new ORPCError("BAD_REQUEST", { message: authErrors.invalidToken(locale) });
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
			message: authErrors.passwordResetSuccess(locale),
		};
	});

export const sendVerification = os.auth.sendVerification
	.use(dbProvider)
	.handler(async ({ input, context }) => {
		const { email, locale: inputLocale } = input;
		const { db, env, cloudflare } = context;
		const locale: Locale =
			(inputLocale as Locale) || (getLocaleFromRequest(cloudflare?.request) as Locale);

		try {
			const { EmailVerificationService } = await import("~/server/services/emailVerification");
			const emailVerificationService = new EmailVerificationService(db, env);

			// Send verification email (returns true even if email doesn't exist for security)
			const sent = await emailVerificationService.resendVerificationEmail(email, inputLocale);

			if (sent) {
				return {
					success: true,
					message: authErrors.emailResendSuccess(locale),
				};
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: authErrors.emailResendFailed(locale),
			});
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: authErrors.internalServerError(locale),
			});
		}
	});

export const logout = os.auth.logout.use(dbProvider).handler(async ({ input, context }) => {
	const { refreshToken } = input;
	const { env, cloudflare } = context;
	// Get user locale from request headers
	const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

	try {
		// Verify refresh token
		const { verifyRefreshToken } = await import("~/server/utils/jwt");
		const userId = await verifyRefreshToken(refreshToken, env);
		if (!userId) {
			throw new ORPCError("UNAUTHORIZED", { message: authErrors.invalidToken(locale) });
		}

		// In a JWT-based system, logout is typically handled client-side
		// by removing the token. For simplicity, we'll just return success
		return {
			success: true,
			message: authErrors.logoutSuccess(locale),
		};
	} catch (error) {
		if (error instanceof ORPCError) {
			throw error;
		}
		throw new ORPCError("INTERNAL_SERVER_ERROR", { message: authErrors.logoutFailed(locale) });
	}
});

// OAuth initialization endpoints
export const oauthInitialize = os.auth.oauthInitialize
	.use(authRateLimit)
	.handler(async ({ input, context }) => {
		const { provider, redirectUrl, action } = input;
		const { db, env, cloudflare } = context;
		const providers = createOAuthProviders(env);
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		// Import security utilities
		const { validateRedirectUrl, performOAuthSecurityChecks, generateNonce, OAUTH_CONFIG } =
			await import("~/server/utils/oauthSecurity");

		// Validate redirect URL to prevent open redirect
		// const allowedDomains = [
		// 	new URL(env.FRONTEND_URL || "http://localhost:3000").hostname,
		// 	"localhost",
		// ];
		//
		// if (redirectUrl && !validateRedirectUrl(redirectUrl, allowedDomains)) {
		// 	throw new ORPCError("BAD_REQUEST", {
		// 		message: locale === "ja" ? "無効なリダイレクトURLです" : "Invalid redirect URL",
		// 	});
		// }

		// Get client IP for security tracking
		const clientIp =
			cloudflare?.request?.headers?.get("CF-Connecting-IP") ||
			cloudflare?.request?.headers?.get("X-Forwarded-For") ||
			"unknown";

		// Perform security checks
		await performOAuthSecurityChecks(db, clientIp, locale);

		// Generate state for CSRF protection with action encoded
		const stateData = {
			random: generateState(),
			action,
			nonce: generateNonce(), // Additional entropy
		};
		const state = Buffer.from(JSON.stringify(stateData)).toString("base64url");
		const codeVerifier = provider === "google" ? generateCodeVerifier() : undefined;

		// Clean up expired states before creating new one
		const { cleanupExpiredOAuthStates } = await import("~/server/utils/oauthCleanup");
		await cleanupExpiredOAuthStates(db);

		// Store state in database with security metadata
		const { generateId } = await import("~/server/utils/crypto");
		const expiresAt = Math.floor(Date.now() / 1000) + OAUTH_CONFIG.STATE_EXPIRATION;

		await db.oAuthState.create({
			data: {
				id: generateId(),
				state: stateData.random, // Store the random part, not the encoded state
				provider,
				codeVerifier,
				redirectUrl: redirectUrl || "/",
				clientIp,
				nonce: stateData.nonce,
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
	});

// OAuth callback handler
export const oauthCallback = os.auth.oauthCallback
	.use(authRateLimit)
	.handler(async ({ input, context }) => {
		const { provider, code, state } = input;
		const { db, env, cloudflare } = context;
		// Get user locale from request headers
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		console.log("OAuth callback started:", {
			provider,
			code: `${code?.substring(0, 10)}...`,
			state,
		});

		const providers = createOAuthProviders(env);

		// Import security utilities
		const { validateOAuthResponse } = await import("~/server/utils/oauthSecurity");

		// Validate OAuth response parameters
		validateOAuthResponse({ code, state }, locale);

		// Decode state to extract action
		let stateData: { random: string; action: string; nonce?: string };
		try {
			stateData = JSON.parse(Buffer.from(state, "base64url").toString());
		} catch (e) {
			console.error("Failed to decode state:", e);
			throw new ORPCError("BAD_REQUEST", { message: authErrors.invalidState(locale) });
		}

		// Verify state
		const stateRecord = await db.oAuthState.findUnique({
			where: { state: stateData.random },
		});

		console.log("State record found:", stateRecord ? "yes" : "no");
		console.log("Action from state:", stateData.action);

		// Timing-safe state validation with CSRF protection
		// 1. Check if state exists in database (prevents forged states)
		// 2. Use timing-safe comparison to prevent timing attacks
		// 3. Verify provider matches to prevent cross-provider attacks
		// 4. Check expiration to prevent replay attacks
		// 5. Verify nonce if present for additional security
		const isValidState =
			stateRecord &&
			safeCompare(stateRecord.state, stateData.random) &&
			safeCompare(stateRecord.provider, provider) &&
			stateRecord.expiresAt >= Math.floor(Date.now() / 1000) &&
			(!stateData.nonce || !stateRecord.nonce || safeCompare(stateRecord.nonce, stateData.nonce));

		if (!isValidState) {
			console.error("State validation failed", {
				stateExists: !!stateRecord,
				providerMatch: stateRecord ? stateRecord.provider === provider : false,
				expired: stateRecord ? stateRecord.expiresAt < Math.floor(Date.now() / 1000) : false,
			});
			throw new ORPCError("BAD_REQUEST", { message: authErrors.invalidState(locale) });
		}

		// Clean up state
		await db.oAuthState.delete({ where: { id: stateRecord.id } });

		try {
			let tokens: { accessToken: () => string };
			let userInfo: { id: string; email: string; username?: string };

			if (provider === "google") {
				if (!stateRecord.codeVerifier) {
					throw new ORPCError("BAD_REQUEST", { message: authErrors.invalidState(locale) });
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
						message: authErrors.oauthFailed(locale, "Google"),
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
						message: authErrors.oauthFailed(locale, "GitHub"),
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
						message: authErrors.oauthNoEmail(locale, "GitHub"),
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
				message: authErrors.oauthAuthFailed(locale, errorMessage),
			});
		}
	});

// Export all procedures as a group for the router
export const authProcedures = {
	register,
	login,
	refresh,
	verifyEmail,
	sendPasswordReset,
	resetPassword,
	sendVerification,
	logout,
	oauthInitialize,
	oauthCallback,
};
