import { ORPCError } from "@orpc/server";
import type { PrismaClient, User } from "@prisma/client";
import { nanoid } from "nanoid";
import { UserRepository } from "../repositories/UserRepository";
import type { CloudflareEnv } from "../types/env";
import { hashPassword, verifyPassword } from "../utils/crypto";
import { sendEmail } from "../utils/email";
import { createJWT, createRefreshToken, generateToken, verifyToken } from "../utils/jwt";

export class AuthService {
	private userRepository: UserRepository;

	constructor(
		private db: PrismaClient,
		private env: CloudflareEnv,
	) {
		this.userRepository = new UserRepository(db);
	}

	/**
	 * ユーザー登録
	 */
	async register(data: { username: string; email: string; password: string; locale?: string }) {
		// 既存ユーザーチェック
		const existingUser = await this.userRepository.findByEmail(data.email);
		if (existingUser) {
			throw new ORPCError("CONFLICT", {
				message: "このメールアドレスは既に登録されています",
			});
		}

		const existingUsername = await this.userRepository.findByUsername(data.username);
		if (existingUsername) {
			throw new ORPCError("CONFLICT", {
				message: "このユーザー名は既に使用されています",
			});
		}

		// パスワードのハッシュ化
		const hashedPassword = await hashPassword(data.password);
		const userId = nanoid();

		// ユーザー作成
		const user = await this.userRepository.create({
			id: userId,
			username: data.username,
			email: data.email,
			passwordHash: hashedPassword,
			emailVerified: false,
		});

		// 確認メール送信
		const verificationToken = await generateToken(
			{ userId: user.id, email: user.email },
			this.env.JWT_SECRET,
			"1h",
		);

		await this.sendVerificationEmail(user.email, verificationToken, data.locale || "ja");

		return {
			success: true,
			message: "Registration successful. Please check your email to verify your account.",
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
			},
		};
	}

	/**
	 * ログイン
	 */
	async login(email: string, password: string) {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "メールアドレスまたはパスワードが正しくありません",
			});
		}

		if (!user.passwordHash) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "メールアドレスまたはパスワードが正しくありません",
			});
		}

		const isValid = await verifyPassword(password, user.passwordHash);
		if (!isValid) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "メールアドレスまたはパスワードが正しくありません",
			});
		}

		if (!user.emailVerified) {
			throw new ORPCError("FORBIDDEN", {
				message: "メールアドレスの確認が必要です",
			});
		}

		// 最終ログイン時刻を更新
		await this.userRepository.updateLastLogin(user.id);

		// アクセストークン生成
		const accessToken = await createJWT(
			{
				sub: user.id,
				email: user.email,
				username: user.username,
				emailVerified: user.emailVerified,
			},
			this.env,
		);

		// リフレッシュトークン生成
		const refreshToken = await createRefreshToken(user.id, this.env);

		return {
			accessToken,
			refreshToken,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				emailVerified: user.emailVerified,
			},
		};
	}

	/**
	 * メールアドレスの確認
	 */
	async verifyEmail(token: string) {
		try {
			const payload = await verifyToken(token, this.env.JWT_SECRET);
			const { userId, email } = payload as { userId: string; email: string };

			const user = await this.userRepository.findById(userId);
			if (!user || user.email !== email) {
				throw new ORPCError("BAD_REQUEST", {
					message: "無効な確認トークンです",
				});
			}

			if (user.emailVerified) {
				return { message: "メールアドレスは既に確認済みです" };
			}

			await this.userRepository.verifyEmail(userId);

			return { message: "メールアドレスが確認されました" };
		} catch (error) {
			throw new ORPCError("BAD_REQUEST", {
				message: "無効または期限切れのトークンです",
			});
		}
	}

	/**
	 * パスワードリセットのリクエスト
	 */
	async requestPasswordReset(email: string, locale = "ja") {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			// セキュリティのため、ユーザーが存在しない場合もエラーを出さない
			return { message: "メールが送信されました" };
		}

		const resetToken = await generateToken(
			{ userId: user.id, email: user.email },
			this.env.JWT_SECRET,
			"1h",
		);

		await this.sendPasswordResetEmail(email, resetToken, locale);

		return { message: "パスワードリセットメールを送信しました" };
	}

	/**
	 * パスワードのリセット
	 */
	async resetPassword(token: string, newPassword: string) {
		try {
			const payload = await verifyToken(token, this.env.JWT_SECRET);
			const { userId } = payload as { userId: string };

			const hashedPassword = await hashPassword(newPassword);
			await this.userRepository.updatePassword(userId, hashedPassword);

			return { message: "パスワードがリセットされました" };
		} catch (error) {
			throw new ORPCError("BAD_REQUEST", {
				message: "無効または期限切れのトークンです",
			});
		}
	}

	/**
	 * 確認メール再送信
	 */
	async resendVerificationEmail(userId: string, locale = "ja") {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new ORPCError("NOT_FOUND", {
				message: "ユーザーが見つかりません",
			});
		}

		if (user.emailVerified) {
			throw new ORPCError("BAD_REQUEST", {
				message: "メールアドレスは既に確認済みです",
			});
		}

		const verificationToken = await generateToken(
			{ userId: user.id, email: user.email },
			this.env.JWT_SECRET,
			"1h",
		);

		await this.sendVerificationEmail(user.email, verificationToken, locale);

		return { message: "確認メールを再送信しました" };
	}

	/**
	 * 確認メールを送信
	 */
	private async sendVerificationEmail(email: string, token: string, locale: string) {
		const verifyUrl = `${this.env.FRONTEND_URL}/verify-email?token=${token}`;

		const templates = {
			ja: {
				subject: "メールアドレスの確認",
				body: `
					<h2>メールアドレスの確認</h2>
					<p>zxcvへのご登録ありがとうございます。</p>
					<p>以下のリンクをクリックして、メールアドレスを確認してください：</p>
					<a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">メールアドレスを確認</a>
					<p>このリンクは1時間で有効期限が切れます。</p>
					<p>心当たりがない場合は、このメールを無視してください。</p>
				`,
			},
			en: {
				subject: "Verify your email address",
				body: `
					<h2>Verify your email address</h2>
					<p>Thank you for registering with zxcv.</p>
					<p>Please click the link below to verify your email address:</p>
					<a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
					<p>This link will expire in 1 hour.</p>
					<p>If you didn't request this, please ignore this email.</p>
				`,
			},
		};

		const template = templates[locale as keyof typeof templates] || templates.ja;

		await sendEmail(this.env, email, template.subject, template.body);
	}

	/**
	 * パスワードリセットメールを送信
	 */
	private async sendPasswordResetEmail(email: string, token: string, locale: string) {
		const resetUrl = `${this.env.FRONTEND_URL}/reset-password?token=${token}`;

		const templates = {
			ja: {
				subject: "パスワードのリセット",
				body: `
					<h2>パスワードのリセット</h2>
					<p>パスワードリセットのリクエストを受け付けました。</p>
					<p>以下のリンクをクリックして、新しいパスワードを設定してください：</p>
					<a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">パスワードをリセット</a>
					<p>このリンクは1時間で有効期限が切れます。</p>
					<p>心当たりがない場合は、このメールを無視してください。</p>
				`,
			},
			en: {
				subject: "Reset your password",
				body: `
					<h2>Reset your password</h2>
					<p>We received a request to reset your password.</p>
					<p>Please click the link below to set a new password:</p>
					<a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
					<p>This link will expire in 1 hour.</p>
					<p>If you didn't request this, please ignore this email.</p>
				`,
			},
		};

		const template = templates[locale as keyof typeof templates] || templates.ja;

		await sendEmail(this.env, email, template.subject, template.body);
	}

	/**
	 * IDでユーザーを取得
	 */
	async getUserById(userId: string): Promise<User | null> {
		return await this.userRepository.findById(userId);
	}

	/**
	 * OAuthログインを処理
	 */
	async handleOAuthLogin(
		provider: "google" | "github",
		userInfo: {
			id: string;
			email: string;
			username?: string;
		},
	) {
		// OAuthアカウントが既に存在するかチェック
		const existingOAuth = await this.db.oAuthAccount.findUnique({
			where: {
				// biome-ignore lint/style/useNamingConvention: Prisma compound key
				provider_providerId: {
					provider,
					providerId: userInfo.id,
				},
			},
			include: { user: true },
		});

		let user: User;
		if (existingOAuth) {
			// 既存のOAuthアカウント
			user = existingOAuth.user;
		} else {
			// メールアドレスで既存ユーザーをチェック
			const existingUser = await this.userRepository.findByEmail(userInfo.email);

			if (existingUser) {
				// 既存ユーザーにOAuthアカウントをリンク
				await this.db.oAuthAccount.create({
					data: {
						id: nanoid(),
						userId: existingUser.id,
						provider,
						providerId: userInfo.id,
						email: userInfo.email,
						username: userInfo.username,
						createdAt: Math.floor(Date.now() / 1000),
					},
				});
				user = existingUser;
			} else {
				// 新規ユーザーを作成
				let username = (userInfo.username || userInfo.email.split("@")[0]).toLowerCase();

				// ユニークなユーザー名を生成
				let usernameCounter = 0;
				while (await this.userRepository.findByUsername(username)) {
					usernameCounter++;
					username = `${(userInfo.username || userInfo.email.split("@")[0]).toLowerCase()}${usernameCounter}`;
				}

				user = await this.db.user.create({
					data: {
						id: nanoid(),
						email: userInfo.email.toLowerCase(),
						username,
						passwordHash: null, // OAuthユーザーはパスワードなし
						emailVerified: true, // OAuthプロバイダーはメールを検証済み
						createdAt: Math.floor(Date.now() / 1000),
						updatedAt: Math.floor(Date.now() / 1000),
						oauthAccounts: {
							create: {
								id: nanoid(),
								provider,
								providerId: userInfo.id,
								email: userInfo.email,
								username: userInfo.username,
								createdAt: Math.floor(Date.now() / 1000),
							},
						},
					},
				});
			}
		}

		// 最終ログイン時刻を更新
		await this.userRepository.updateLastLogin(user.id);

		// トークン生成
		const accessToken = await generateToken(
			{
				sub: user.id,
				email: user.email,
				username: user.username,
				emailVerified: user.emailVerified,
			},
			this.env.JWT_SECRET,
			"1h",
		);

		const refreshToken = await generateToken(
			{
				sub: user.id,
				type: "refresh",
			},
			this.env.JWT_SECRET,
			"7d",
		);

		return {
			accessToken,
			refreshToken,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				emailVerified: user.emailVerified,
			},
		};
	}
}
