import { ORPCError } from "@orpc/server";
import { os } from "~/server/orpc";
import { dbProvider, dbWithAuth } from "~/server/orpc/middleware/combined";
import { AuthService } from "~/server/services/AuthService";
import { generateToken } from "~/server/utils/jwt";

export const authProcedures = {
	/**
	 * ユーザー登録
	 */
	register: os.auth.register.use(dbProvider).handler(async ({ input, context }) => {
		const { db, env } = context;
		const authService = new AuthService(db, env);

		const { user } = await authService.register(input);
		return {
			success: true,
			message: "Registration successful",
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
			},
		};
	}),

	/**
	 * ログイン
	 */
	login: os.auth.login.use(dbProvider).handler(async ({ input, context }) => {
		const { db, env } = context;
		const authService = new AuthService(db, env);

		const { user, token } = await authService.login(input.email, input.password);
		return {
			accessToken: token,
			refreshToken: token, // For now using same token
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				emailVerified: user.emailVerified,
			},
			message: "Login successful",
		};
	}),

	/**
	 * ログアウト
	 */
	logout: os.auth.logout.use(dbWithAuth).handler(async () => {
		// JWTトークンベースの認証なので、サーバー側での処理は不要
		// クライアント側でトークンを削除する
		return { success: true, message: "Logged out successfully" };
	}),

	/**
	 * メール確認トークンの送信
	 */
	sendVerification: os.auth.sendVerification.use(dbProvider).handler(async ({ input, context }) => {
		const { db, env } = context;
		const authService = new AuthService(db, env);

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
		const { db, env } = context;
		const authService = new AuthService(db, env);

		await authService.verifyEmail(input.token);
		return { success: true, message: "Email verified successfully" };
	}),

	/**
	 * パスワードリセットトークンの送信
	 */
	sendPasswordReset: os.auth.sendPasswordReset
		.use(dbProvider)
		.handler(async ({ input, context }) => {
			const { db, env } = context;
			const authService = new AuthService(db, env);

			// パスワードリセットメール送信
			await authService.requestPasswordReset(input.email, input.locale);

			return { success: true, message: "Password reset email sent" };
		}),

	/**
	 * パスワードリセット
	 */
	resetPassword: os.auth.resetPassword.use(dbProvider).handler(async ({ input, context }) => {
		const { db, env } = context;
		const authService = new AuthService(db, env);

		await authService.resetPassword(input.token, input.newPassword);
		return { success: true, message: "Password reset successfully" };
	}),

	/**
	 * リフレッシュトークン
	 */
	refresh: os.auth.refresh.use(dbWithAuth).handler(async ({ context }) => {
		const { env, user } = context;

		// 現在のユーザー情報から新しいトークンを生成
		const token = await generateToken(
			{
				sub: user.id,
				email: user.email,
				username: user.username,
				emailVerified: user.emailVerified,
			},
			env.JWT_SECRET,
			"7d",
		);

		return {
			accessToken: token,
			refreshToken: token, // 現在の実装では同じトークンを返す
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				emailVerified: user.emailVerified,
			},
		};
	}),

	/**
	 * OAuth初期化
	 */
	oauthInitialize: os.auth.oauthInitialize.use(dbProvider).handler(async ({ input, context }) => {
		const { provider, redirectUrl, action } = input;
		const { db, env } = context;

		const { createOAuthProviders, generateState, generateCodeVerifier } = await import(
			"~/server/utils/oauth"
		);
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
		if (provider === "github") {
			const url = providers.github.createAuthorizationURL(state, ["user:email"]);
			authorizationUrl = url.toString();
		} else {
			throw new ORPCError("BAD_REQUEST", { message: "サポートされていないプロバイダーです" });
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
		const { db, env } = context;
		const authService = new AuthService(db, env);

		console.log("OAuth callback started:", {
			provider,
			code: `${code?.substring(0, 10)}...`,
			state,
		});

		const { createOAuthProviders } = await import("~/server/utils/oauth");
		const providers = createOAuthProviders(env);

		// Decode state to extract action
		let stateData: { random: string; action: string };
		try {
			stateData = JSON.parse(Buffer.from(state, "base64url").toString());
		} catch (e) {
			console.error("Failed to decode state:", e);
			throw new ORPCError("BAD_REQUEST", { message: "無効な状態フォーマットです" });
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
			throw new ORPCError("BAD_REQUEST", { message: "無効または期限切れの状態です" });
		}

		// Clean up state
		await db.oAuthState.delete({ where: { id: stateRecord.id } });

		try {
			let tokens: { accessToken: () => string };
			let userInfo: { id: string; email: string; username?: string };

			if (provider === "github") {
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
						message: "GitHubアカウントにメールアドレスが見つかりません",
					});
				}

				userInfo = {
					id: githubUser.id.toString(),
					email: primaryEmail,
					username: githubUser.login,
				};
			} else {
				throw new ORPCError("BAD_REQUEST", { message: "サポートされていないプロバイダーです" });
			}

			// Use AuthService to handle OAuth login
			const result = await authService.handleOAuthLogin(provider, userInfo);

			return {
				accessToken: result.token,
				refreshToken: result.token, // For now using same token
				user: result.user,
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
				message: `OAuth認証に失敗しました: ${errorMessage}`,
			});
		}
	}),
};
