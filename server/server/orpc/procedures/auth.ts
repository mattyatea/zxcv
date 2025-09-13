import { ORPCError } from "@orpc/server";
import { AuthService } from "../../services/AuthService";
import { EmailServiceError } from "../../types/errors";
import type { AuthUser } from "../../utils/auth";
import { generateId } from "../../utils/crypto";
import { authErrors, type Locale } from "../../utils/i18n";
import { getLocaleFromRequest } from "../../utils/locale";
import { createLogger } from "../../utils/logger";
import { os } from "../index";
import { dbProvider } from "../middleware/combined";
import { authRateLimit, passwordResetRateLimit, registerRateLimit } from "../middleware/rateLimit";

export const authProcedures = {
	/**
	 * ユーザー登録
	 */
	register: os.auth.register.use(registerRateLimit).handler(async ({ input, context }) => {
		const { db, env, cloudflare } = context;
		const authService = new AuthService(db, env);
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		try {
			const result = await authService.register(input);
			return {
				success: true,
				message: authErrors.registrationSuccess(locale),
				user: {
					id: result.user.id,
					username: result.user.username,
					email: result.user.email,
				},
			};
		} catch (error) {
			// If it's an email sending error and user was created, clean up
			if (error instanceof EmailServiceError) {
				// This would need to be implemented in the actual service
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: authErrors.registrationFailedEmail(locale),
				});
			}
			throw error;
		}
	}),

	/**
	 * ログイン
	 */
	login: os.auth.login.use(authRateLimit).handler(async ({ input, context }) => {
		const { db, env, cloudflare } = context;
		const authService = new AuthService(db, env);
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		const result = await authService.login(input.email, input.password, locale);
		return {
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
			user: result.user,
			message: authErrors.loginSuccess(locale),
		};
	}),

	/**
	 * ログアウト
	 */
	logout: os.auth.logout.use(dbProvider).handler(async ({ input, context }) => {
		const { refreshToken } = input;
		const { env, cloudflare } = context;
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		try {
			// Verify refresh token
			const { verifyRefreshToken } = await import("../../utils/jwt");
			const userId = await verifyRefreshToken(refreshToken, env);
			if (!userId) {
				throw new ORPCError("UNAUTHORIZED", { message: "Invalid token" });
			}

			// In a JWT-based system, logout is typically handled client-side
			// by removing the token. For simplicity, we'll just return success
			return {
				success: true,
				message: "Logged out successfully",
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Logout failed" });
		}
	}),

	/**
	 * メール確認トークンの送信
	 */
	sendVerification: os.auth.sendVerification.use(dbProvider).handler(async ({ input, context }) => {
		const { db, env, cloudflare } = context;
		const authService = new AuthService(db, env);
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		// Find user by email
		const user = await db.user.findUnique({
			where: { email: input.email },
		});

		if (!user) {
			throw new ORPCError("NOT_FOUND", {
				message: "User not found",
			});
		}

		// 確認メール送信
		await authService.resendVerificationEmail(user.id, input.locale || "ja");

		return { success: true, message: "Verification email sent" };
	}),

	/**
	 * メール確認
	 */
	verifyEmail: os.auth.verifyEmail.use(dbProvider).handler(async ({ input, context }) => {
		const { db, env, cloudflare } = context;
		const authService = new AuthService(db, env);
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		await authService.verifyEmail(input.token);
		return { success: true, message: "Email verified successfully" };
	}),

	/**
	 * パスワードリセットトークンの送信
	 */
	sendPasswordReset: os.auth.sendPasswordReset
		.use(passwordResetRateLimit)
		.handler(async ({ input, context }) => {
			const { db, env, cloudflare } = context;
			const authService = new AuthService(db, env);
			const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

			// パスワードリセットメール送信
			await authService.requestPasswordReset(input.email, locale);

			return { success: true, message: "Password reset email sent" };
		}),

	/**
	 * パスワードリセット
	 */
	resetPassword: os.auth.resetPassword.use(dbProvider).handler(async ({ input, context }) => {
		const { db, env, cloudflare } = context;
		const authService = new AuthService(db, env);
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		await authService.resetPassword(input.token, input.newPassword);
		return { success: true, message: "Password reset successfully" };
	}),

	/**
	 * リフレッシュトークン
	 */
	refresh: os.auth.refresh.use(dbProvider).handler(async ({ input, context }) => {
		const { refreshToken } = input;
		const { db, env, cloudflare } = context;
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		// Verify refresh token
		const { verifyRefreshToken, createRefreshToken, createJWT } = await import("../../utils/jwt");
		const userId = await verifyRefreshToken(refreshToken, env);

		if (!userId) {
			throw new ORPCError("UNAUTHORIZED", { message: "Invalid token" });
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
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
		};

		const accessToken = await createJWT(
			{
				sub: authUser.id,
				email: authUser.email,
				username: authUser.username,
				emailVerified: authUser.emailVerified,
				displayName: authUser.displayName,
				avatarUrl: authUser.avatarUrl,
			},
			env,
		);
		const newRefreshToken = await createRefreshToken(authUser.id, env);

		return { accessToken, refreshToken: newRefreshToken, user: authUser };
	}),

	/**
	 * OAuth初期化
	 */
	oauthInitialize: os.auth.oauthInitialize
		.use(authRateLimit)
		.handler(async ({ input, context }) => {
			const { provider, redirectUrl, action } = input;
			const { db, env, cloudflare } = context;
			const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

			const { createOAuthProviders, generateState, generateCodeVerifier } = await import(
				"../../utils/oauth"
			);
			const providers = createOAuthProviders(env);

			// Import security utilities
			const { validateRedirectUrl, performOAuthSecurityChecks, generateNonce, OAUTH_CONFIG } =
				await import("../../utils/oauthSecurity");

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
			const { cleanupExpiredOAuthStates } = await import("../../utils/oauthCleanup");
			await cleanupExpiredOAuthStates(db);

			// Store state in database
			const { generateId } = await import("../../utils/crypto");
			const expiresAt = Math.floor(Date.now() / 1000) + 600; // 10 minutes

			await db.oAuthState.create({
				data: {
					id: generateId(),
					state: stateData.random, // Store the random part, not the encoded state
					provider,
					codeVerifier,
					redirectUrl: redirectUrl || "/",
					expiresAt,
					clientIp, // Store the client IP for verification
				},
			});

			// Generate authorization URL
			let authorizationUrl: string;
			if (provider === "github") {
				const url = providers.github.createAuthorizationURL(state, ["user:email"]);
				authorizationUrl = url.toString();
			} else if (provider === "google") {
				if (!codeVerifier) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: authErrors.codeVerifierNotGenerated(locale),
					});
				}
				const url = providers.google.createAuthorizationURL(state, codeVerifier, [
					"https://www.googleapis.com/auth/userinfo.email",
					"https://www.googleapis.com/auth/userinfo.profile",
				]);
				authorizationUrl = url.toString();
			} else {
				throw new ORPCError("BAD_REQUEST", {
					message: authErrors.unsupportedProvider(locale),
				});
			}

			return {
				authorizationUrl,
			};
		}),

	/**
	 * OAuthコールバック
	 */
	oauthCallback: os.auth.oauthCallback.use(dbProvider).handler(async ({ input, context }) => {
		const { provider, code, state } = input;
		const { db, env, cloudflare } = context;
		const authService = new AuthService(db, env);
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		const logger = createLogger(env);
		logger.debug("OAuth callback started", {
			provider,
			code: `${code?.substring(0, 10)}...`,
			state,
		});

		const { createOAuthProviders } = await import("../../utils/oauth");
		const providers = createOAuthProviders(env);

		// Import security utilities
		const { validateOAuthResponse } = await import("../../utils/oauthSecurity");

		// Validate OAuth response parameters
		validateOAuthResponse({ code, state }, locale);

		// Decode state to extract action
		let stateData: { random: string; action: string };
		try {
			stateData = JSON.parse(Buffer.from(state, "base64url").toString());
		} catch (e) {
			logger.error("Failed to decode state", e as Error);
			throw new ORPCError("BAD_REQUEST", { message: "無効または期限切れの状態です" });
		}

		// Verify state
		const stateRecord = await db.oAuthState.findUnique({
			where: { state: stateData.random },
		});

		logger.debug("State record found", { stateRecord });
		logger.debug("Action from state", { action: stateData.action });

		if (
			!stateRecord ||
			stateRecord.provider !== provider ||
			stateRecord.expiresAt < Math.floor(Date.now() / 1000)
		) {
			logger.error("State validation failed", undefined, {
				stateRecord,
				provider,
				currentTime: Math.floor(Date.now() / 1000),
			});
			throw new ORPCError("BAD_REQUEST", { message: "無効または期限切れの状態です" });
		}

		// Verify client IP matches (if stored)
		if (stateRecord.clientIp && stateRecord.clientIp !== "unknown") {
			const currentClientIp =
				cloudflare?.request?.headers?.get("CF-Connecting-IP") ||
				cloudflare?.request?.headers?.get("X-Forwarded-For") ||
				"unknown";

			if (stateRecord.clientIp !== currentClientIp) {
				logger.warn("OAuth callback IP mismatch", {
					stored: stateRecord.clientIp,
					current: currentClientIp,
				});
				// For now, just log the mismatch but don't block the request
				// In a high-security environment, you might want to throw an error here
			}
		}

		// Clean up state
		await db.oAuthState.delete({ where: { id: stateRecord.id } });

		try {
			let tokens: { accessToken: () => string };
			let userInfo: { id: string; email: string; username?: string };

			if (provider === "github") {
				logger.debug("Validating GitHub authorization code");
				tokens = await providers.github.validateAuthorizationCode(code);
				logger.debug("GitHub token obtained");

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

				logger.debug("GitHub API responses", {
					userStatus: userResponse.status,
					emailStatus: emailResponse.status,
				});

				if (!userResponse.ok || !emailResponse.ok) {
					logger.error("GitHub API error", undefined, {
						userStatus: userResponse.status,
						userText: await userResponse.text(),
						emailStatus: emailResponse.status,
						emailText: await emailResponse.text(),
					});
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "GitHub認証に失敗しました",
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
			} else if (provider === "google") {
				logger.debug("Validating Google authorization code");

				// Get code verifier from state record
				if (!stateRecord.codeVerifier) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Code verifier not found for Google OAuth",
					});
				}

				tokens = await providers.google.validateAuthorizationCode(code, stateRecord.codeVerifier);
				logger.debug("Google token obtained");

				// Fetch user info from Google
				const googleUserResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
					headers: {
						Authorization: `Bearer ${tokens.accessToken()}`,
					},
				});

				logger.debug("Google API response", {
					status: googleUserResponse.status,
				});

				if (!googleUserResponse.ok) {
					logger.error("Google API error", undefined, {
						status: googleUserResponse.status,
						text: await googleUserResponse.text(),
					});
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "Google認証に失敗しました",
					});
				}

				const googleUser = (await googleUserResponse.json()) as {
					id: string;
					email: string;
					name?: string;
					verified_email: boolean;
				};

				if (!googleUser.email) {
					throw new ORPCError("BAD_REQUEST", {
						message: authErrors.oauthNoEmail(locale, "Google"),
					});
				}

				userInfo = {
					id: googleUser.id,
					email: googleUser.email,
					username: googleUser.email.split("@")[0], // Use email prefix as username
				};
			} else {
				throw new ORPCError("BAD_REQUEST", {
					message: authErrors.unsupportedProvider(locale),
				});
			}

			// Use AuthService to handle OAuth login
			const result = await authService.handleOAuthLogin(provider, userInfo, stateData.action);

			// Check if username is required
			if ("requiresUsername" in result && result.requiresUsername) {
				return {
					tempToken: result.tempToken,
					provider: result.provider,
					requiresUsername: true as const,
				};
			}

			return {
				accessToken: (result as { accessToken: string; refreshToken: string; user: AuthUser })
					.accessToken,
				refreshToken: (result as { accessToken: string; refreshToken: string; user: AuthUser })
					.refreshToken,
				user: (result as { accessToken: string; refreshToken: string; user: AuthUser }).user,
				redirectUrl: stateRecord.redirectUrl || "/",
			};
		} catch (error) {
			logger.error("OAuth callback error", error as Error);
			if (error instanceof ORPCError) {
				throw error;
			}

			// Provide more detailed error information for debugging
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			logger.error("Detailed error", undefined, {
				message: errorMessage,
				stack: error instanceof Error ? error.stack : undefined,
				error: error,
			});

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: `OAuth認証に失敗しました: ${errorMessage}`,
			});
		}
	}),

	checkUsername: os.auth.checkUsername.use(dbProvider).handler(async ({ input, context }) => {
		const { username } = input;
		const db = context.db;

		// Check if username is already taken
		const existingUser = await db.user.findUnique({
			where: { username: username.toLowerCase() },
		});

		return {
			available: !existingUser,
		};
	}),

	completeOAuthRegistration: os.auth.completeOAuthRegistration
		.use(dbProvider)
		.handler(async ({ input, context }) => {
			const { tempToken, username } = input;
			const { db, env, cloudflare } = context;
			const locale = getLocaleFromRequest(cloudflare?.request) as Locale;
			const logger = createLogger(env);

			try {
				// Get temp registration
				const tempReg = await db.oAuthTempRegistration.findUnique({
					where: { token: tempToken },
				});

				if (!tempReg) {
					throw new ORPCError("BAD_REQUEST", {
						message: authErrors.invalidToken(locale),
					});
				}

				// Check if expired
				if (tempReg.expiresAt < Math.floor(Date.now() / 1000)) {
					// Clean up expired registration
					await db.oAuthTempRegistration.delete({
						where: { id: tempReg.id },
					});
					throw new ORPCError("BAD_REQUEST", {
						message: authErrors.tokenExpired(locale),
					});
				}

				// Check if username is available
				const existingUser = await db.user.findUnique({
					where: { username: username.toLowerCase() },
				});

				if (existingUser) {
					throw new ORPCError("CONFLICT", {
						message: "このユーザー名は既に使用されています",
					});
				}

				// Create user and OAuth account
				const userId = generateId();
				const oauthAccountId = generateId();
				const now = Math.floor(Date.now() / 1000);

				const user = await db.user.create({
					data: {
						id: userId,
						email: tempReg.email.toLowerCase(),
						username: username.toLowerCase(),
						passwordHash: null, // OAuth users don't have passwords
						emailVerified: true, // OAuth providers verify email
						createdAt: now,
						updatedAt: now,
						oauthAccounts: {
							create: {
								id: oauthAccountId,
								provider: tempReg.provider,
								providerId: tempReg.providerId,
								email: tempReg.email,
								username: tempReg.providerUsername,
								createdAt: now,
								updatedAt: now,
							},
						},
					},
				});

				// Clean up temp registration
				await db.oAuthTempRegistration.delete({
					where: { id: tempReg.id },
				});

				// Generate tokens
				const authService = new AuthService(db, context.env);
				const tokens = await authService.generateTokens(user);

				logger.info("OAuth registration completed", { userId: user.id });

				return {
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
					user: {
						id: user.id,
						username: user.username,
						email: user.email,
						emailVerified: user.emailVerified,
						displayName: user.displayName,
						avatarUrl: user.avatarUrl,
					},
				};
			} catch (error) {
				logger.error("Complete OAuth registration error", error as Error);
				if (error instanceof ORPCError) {
					throw error;
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "登録の完了に失敗しました",
				});
			}
		}),

	/**
	 * Device Authorization Grant - Initialize
	 */
	deviceAuthorize: os.auth.deviceAuthorize.use(dbProvider).handler(async ({ input, context }) => {
		const { clientId, scope } = input;
		const { db, env, cloudflare } = context;
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;
		const logger = createLogger(env);

		const { generateDeviceCode, generateUserCode, cleanupExpiredDeviceCodes } = await import(
			"../../utils/deviceAuth"
		);

		// Cleanup expired codes
		await cleanupExpiredDeviceCodes(db);

		// Generate codes
		const deviceCode = generateDeviceCode();
		const userCode = generateUserCode();
		const expiresIn = 900; // 15 minutes
		const interval = 5; // 5 seconds polling interval

		// Store device code
		const now = Math.floor(Date.now() / 1000);
		const deviceCodeRecord = await db.deviceCode.create({
			data: {
				id: generateId(),
				deviceCode,
				userCode,
				clientId,
				scope,
				expiresAt: now + expiresIn,
				interval,
				createdAt: now,
			},
		});

		logger.info("Device authorization initialized", {
			userCode,
			clientId,
		});

		const baseUrl = env.APP_URL || "http://localhost:3000";

		return {
			deviceCode,
			userCode,
			verificationUri: `${baseUrl}/device`,
			verificationUriComplete: `${baseUrl}/device?code=${userCode}`,
			expiresIn,
			interval,
		};
	}),

	/**
	 * Device Authorization Grant - Token Exchange
	 */
	deviceToken: os.auth.deviceToken.use(dbProvider).handler(async ({ input, context }) => {
		const { deviceCode, clientId } = input;
		const { db, env, cloudflare } = context;
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;
		const logger = createLogger(env);

		const { shouldSlowDown, isRateLimited, generateCliToken, hashCliToken } = await import(
			"../../utils/deviceAuth"
		);

		// Find device code
		const deviceCodeRecord = await db.deviceCode.findUnique({
			where: { deviceCode },
			include: { user: true },
		});

		if (!deviceCodeRecord || deviceCodeRecord.clientId !== clientId) {
			logger.warn("Invalid device code", { deviceCode, clientId });
			return {
				error: "access_denied" as const,
				errorDescription: "Invalid device code or client ID",
			};
		}

		const now = Math.floor(Date.now() / 1000);

		// Check if expired
		if (deviceCodeRecord.expiresAt < now) {
			await db.deviceCode.delete({ where: { id: deviceCodeRecord.id } });
			return {
				error: "expired_token" as const,
				errorDescription: "Device code has expired",
			};
		}

		// Check rate limiting
		if (isRateLimited(deviceCodeRecord.attemptCount)) {
			logger.warn("Device code rate limited", {
				deviceCode,
				attemptCount: deviceCodeRecord.attemptCount,
			});
			return {
				error: "access_denied" as const,
				errorDescription: "Too many attempts",
			};
		}

		// Check polling interval
		if (shouldSlowDown(deviceCodeRecord.lastAttempt, deviceCodeRecord.interval)) {
			await db.deviceCode.update({
				where: { id: deviceCodeRecord.id },
				data: {
					attemptCount: deviceCodeRecord.attemptCount + 1,
					lastAttempt: now,
				},
			});
			return {
				error: "slow_down" as const,
				errorDescription: "Polling too frequently",
			};
		}

		// Update attempt
		await db.deviceCode.update({
			where: { id: deviceCodeRecord.id },
			data: {
				attemptCount: deviceCodeRecord.attemptCount + 1,
				lastAttempt: now,
			},
		});

		// Check if approved
		if (!deviceCodeRecord.isApproved || !deviceCodeRecord.userId) {
			return {
				error: "authorization_pending" as const,
				errorDescription: "Authorization pending",
			};
		}

		// Generate CLI token
		const token = generateCliToken();
		const tokenHash = await hashCliToken(token);

		// Store CLI token
		const cliToken = await db.cliToken.create({
			data: {
				id: generateId(),
				userId: deviceCodeRecord.userId,
				tokenHash,
				clientId,
				scope: deviceCodeRecord.scope,
				createdAt: now,
			},
		});

		// Clean up device code
		await db.deviceCode.delete({ where: { id: deviceCodeRecord.id } });

		logger.info("CLI token issued", {
			userId: deviceCodeRecord.userId,
			clientId,
		});

		return {
			accessToken: token,
			tokenType: "Bearer" as const,
			scope: deviceCodeRecord.scope || undefined,
		};
	}),

	/**
	 * Device Authorization Grant - Verify User Code
	 */
	deviceVerify: os.auth.deviceVerify
		.use(dbProvider)
		.use(async ({ context, next }) => {
			// Verify user is authenticated
			const locale = getLocaleFromRequest(context.cloudflare?.request) as Locale;
			const authHeader = context.cloudflare?.request?.headers?.get("Authorization");
			if (!authHeader?.startsWith("Bearer ")) {
				throw new ORPCError("UNAUTHORIZED", { message: authErrors.authRequired(locale) });
			}

			const token = authHeader.substring(7);
			const { verifyAccessToken } = await import("../../utils/jwt");
			const result = await verifyAccessToken(token, context.env);
			const userId = result?.sub;

			if (!userId) {
				throw new ORPCError("UNAUTHORIZED", { message: authErrors.invalidToken(locale) });
			}

			// Get user
			const user = await context.db.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				throw new ORPCError("UNAUTHORIZED", { message: authErrors.userNotFound(locale) });
			}

			return next({
				context: { ...context, user },
			});
		})
		.handler(async ({ input, context }) => {
			const { userCode } = input;
			const { db, user, env, cloudflare } = context;
			const locale = getLocaleFromRequest(cloudflare?.request) as Locale;
			const logger = createLogger(env);

			// Find device code by user code
			const deviceCodeRecord = await db.deviceCode.findUnique({
				where: { userCode: userCode.toUpperCase() },
			});

			if (!deviceCodeRecord) {
				logger.warn("Invalid user code", { userCode });
				throw new ORPCError("NOT_FOUND", {
					message: authErrors.invalidCode(locale),
				});
			}

			const now = Math.floor(Date.now() / 1000);

			// Check if expired
			if (deviceCodeRecord.expiresAt < now) {
				await db.deviceCode.delete({ where: { id: deviceCodeRecord.id } });
				throw new ORPCError("BAD_REQUEST", {
					message: authErrors.codeExpired(locale),
				});
			}

			// Approve device code
			await db.deviceCode.update({
				where: { id: deviceCodeRecord.id },
				data: {
					isApproved: true,
					userId: user.id,
				},
			});

			logger.info("Device code approved", {
				userCode,
				userId: user.id,
			});

			return {
				success: true,
				message: authErrors.deviceApproved(locale),
			};
		}),

	/**
	 * List CLI Tokens
	 */
	listCliTokens: os.auth.listCliTokens
		.use(dbProvider)
		.use(async ({ context, next }) => {
			// Verify user is authenticated
			const locale = getLocaleFromRequest(context.cloudflare?.request) as Locale;
			const authHeader = context.cloudflare?.request?.headers?.get("Authorization");
			if (!authHeader?.startsWith("Bearer ")) {
				throw new ORPCError("UNAUTHORIZED", { message: authErrors.authRequired(locale) });
			}

			const token = authHeader.substring(7);
			const { verifyAccessToken } = await import("../../utils/jwt");
			const result = await verifyAccessToken(token, context.env);
			const userId = result?.sub;

			if (!userId) {
				throw new ORPCError("UNAUTHORIZED", { message: authErrors.invalidToken(locale) });
			}

			return next({
				context: { ...context, userId },
			});
		})
		.handler(async ({ context }) => {
			const { db, userId } = context;

			const tokens = await db.cliToken.findMany({
				where: { userId },
				select: {
					id: true,
					name: true,
					clientId: true,
					lastUsedAt: true,
					createdAt: true,
				},
				orderBy: { createdAt: "desc" },
			});

			return tokens;
		}),

	/**
	 * Revoke CLI Token
	 */
	revokeCliToken: os.auth.revokeCliToken
		.use(dbProvider)
		.use(async ({ context, next }) => {
			// Verify user is authenticated
			const locale = getLocaleFromRequest(context.cloudflare?.request) as Locale;
			const authHeader = context.cloudflare?.request?.headers?.get("Authorization");
			if (!authHeader?.startsWith("Bearer ")) {
				throw new ORPCError("UNAUTHORIZED", { message: authErrors.authRequired(locale) });
			}

			const token = authHeader.substring(7);
			const { verifyAccessToken } = await import("../../utils/jwt");
			const result = await verifyAccessToken(token, context.env);
			const userId = result?.sub;

			if (!userId) {
				throw new ORPCError("UNAUTHORIZED", { message: authErrors.invalidToken(locale) });
			}

			return next({
				context: { ...context, userId },
			});
		})
		.handler(async ({ input, context }) => {
			const { tokenId } = input;
			const { db, userId, env, cloudflare } = context;
			const locale = getLocaleFromRequest(cloudflare?.request) as Locale;
			const logger = createLogger(env);

			// Verify token belongs to user
			const token = await db.cliToken.findFirst({
				where: {
					id: tokenId,
					userId,
				},
			});

			if (!token) {
				throw new ORPCError("NOT_FOUND", {
					message: authErrors.tokenNotFound(locale),
				});
			}

			// Delete token
			await db.cliToken.delete({
				where: { id: tokenId },
			});

			logger.info("CLI token revoked", {
				tokenId,
				userId,
			});

			return {
				success: true,
				message: authErrors.tokenRevoked(locale),
			};
		}),
};
