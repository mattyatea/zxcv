import { createMimeMessage } from "mimetext";
import type { Env } from "~/server/types/env";

export interface EmailTemplate {
	to: string;
	subject: string;
	html: string;
	text: string;
}

export interface PasswordResetEmailData {
	email: string;
	resetToken: string;
	resetUrl: string;
	userLocale?: string;
}

export interface EmailVerificationData {
	email: string;
	verificationToken: string;
	verificationUrl: string;
	userLocale?: string;
}

export interface TeamInvitationData {
	email: string;
	teamName: string;
	inviterName: string;
	invitationToken: string;
	userLocale?: string;
}

export class EmailService {
	private readonly fromEmail: string;
	private readonly baseUrl: string;
	private readonly env: Env;

	constructor(env: Env) {
		this.fromEmail = env.EMAIL_FROM || "noreply@prism-project.net";
		this.baseUrl = env.FRONTEND_URL || "https://zxcv.dev";
		this.env = env;
	}

	async sendEmail(template: EmailTemplate): Promise<boolean> {
		try {
			// In test environment, use mock email sender
			if (this.isTestEnvironment()) {
				console.log(`[TEST] Email would be sent to: ${template.to}`);
				console.log(`[TEST] Subject: ${template.subject}`);
				return true;
			}

			// Check if EMAIL_SENDER binding is available
			if (!this.env.EMAIL_SENDER) {
				console.error("EMAIL_SENDER binding is not configured");
				return false;
			}

			// Create MIME message using mimetext
			const msg = createMimeMessage();
			msg.setSender({ name: "zxcv", addr: this.fromEmail });
			msg.setRecipient(template.to);
			msg.setSubject(template.subject);

			// Add plain text version
			msg.addMessage({
				contentType: "text/plain",
				data: template.text,
			});

			// Add HTML version
			msg.addMessage({
				contentType: "text/html",
				data: template.html,
			});

			// Create EmailMessage instance
			// Dynamic import for Cloudflare Workers environment
			// biome-ignore lint/suspicious/noExplicitAny: Checking for Cloudflare runtime
			if (typeof (globalThis as any).EmailMessage !== "undefined") {
				// In Cloudflare Workers environment
				const { EmailMessage } = await import("cloudflare:email");
				const emailMessage = new EmailMessage(this.fromEmail, template.to, msg.asRaw());
				await this.env.EMAIL_SENDER.send(emailMessage);
			} else {
				// In local development environment
				console.log("[LOCAL DEV] Email would be sent:");
				console.log(`From: ${this.fromEmail}`);
				console.log(`To: ${template.to}`);
				console.log(`Subject: ${template.subject}`);
				console.log(`Raw size: ${msg.asRaw().length} bytes`);
			}

			return true;
		} catch (error) {
			console.error("Email sending error:", error);
			return false;
		}
	}

	private isTestEnvironment(): boolean {
		// Check for common test environment indicators
		return (
			process.env.NODE_ENV === "test" ||
			process.env.VITEST === "true" ||
			// Check if we're in a test environment by checking if fromEmail is the test email
			this.fromEmail === "test@example.com" ||
			// Check if the baseUrl is the test frontend URL
			this.baseUrl === "http://localhost:3000"
		);
	}

	generatePasswordResetEmail(data: PasswordResetEmailData): EmailTemplate {
		const { email, resetToken, userLocale = "en" } = data;
		const fullResetUrl = `${this.baseUrl}/reset-password?token=${resetToken}`;

		// Generate content based on locale
		const content = this.getPasswordResetContent(userLocale, fullResetUrl);

		return {
			to: email,
			subject: content.subject,
			html: content.html,
			text: content.text,
		};
	}

	generateEmailVerificationEmail(data: EmailVerificationData): EmailTemplate {
		const { email, verificationToken, userLocale = "en" } = data;
		const fullVerificationUrl = `${this.baseUrl}/verify-email?token=${verificationToken}`;

		// Generate content based on locale
		const content = this.getEmailVerificationContent(userLocale, fullVerificationUrl);

		return {
			to: email,
			subject: content.subject,
			html: content.html,
			text: content.text,
		};
	}

	generateTeamInvitationEmail(data: TeamInvitationData): EmailTemplate {
		const { email, teamName, inviterName, invitationToken, userLocale = "ja" } = data;
		const invitationUrl = `${this.baseUrl}/teams/join?token=${invitationToken}`;

		// Generate content based on locale
		const content = this.getTeamInvitationContent(userLocale, teamName, inviterName, invitationUrl);

		return {
			to: email,
			subject: content.subject,
			html: content.html,
			text: content.text,
		};
	}

	private getPasswordResetContent(locale: string, resetUrl: string) {
		const isJapanese = locale === "ja" || locale === "ja-JP";

		if (isJapanese) {
			return {
				subject: "【zxcv】パスワードリセットのお知らせ",
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
						<div style="text-align: center; margin-bottom: 30px;">
							<h1 style="color: #333; margin-bottom: 10px;">zxcv</h1>
							<p style="color: #666; font-size: 16px;">コーディングルール共有プラットフォーム</p>
						</div>

						<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
							<h2 style="color: #333; margin-top: 0;">パスワードリセット</h2>
							<p>パスワードリセットのリクエストを受け付けました。</p>
							<p>下記のボタンをクリックして新しいパスワードを設定してください。</p>
						</div>

						<div style="text-align: center; margin: 30px 0;">
							<a href="${resetUrl}"
							   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
								パスワードをリセット
							</a>
						</div>

						<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
							<p style="margin: 0; color: #856404;">
								<strong>注意:</strong> このリンクは1時間後に期限切れになります。
							</p>
						</div>

						<div style="color: #666; font-size: 14px; margin-top: 30px;">
							<p>もしパスワードリセットを依頼していない場合は、このメールを無視してください。</p>
							<p>リンクが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
							<p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px;">${resetUrl}</p>
						</div>

						<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
							<p>© 2025 zxcv. All rights reserved.</p>
						</div>
					</div>
				`,
				text: `
zxcv - パスワードリセット

パスワードリセットのリクエストを受け付けました。

下記のリンクをクリックして新しいパスワードを設定してください：
${resetUrl}

注意: このリンクは1時間後に期限切れになります。

もしパスワードリセットを依頼していない場合は、このメールを無視してください。

--
© 2025 zxcv. All rights reserved.
				`.trim(),
			};
		}

		// English version
		return {
			subject: "zxcv - Password Reset",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #333; margin-bottom: 10px;">zxcv</h1>
						<p style="color: #666; font-size: 16px;">Coding Rules Sharing Platform</p>
					</div>

					<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
						<h2 style="color: #333; margin-top: 0;">Password Reset</h2>
						<p>We received a request to reset your password.</p>
						<p>Click the button below to set a new password.</p>
					</div>

					<div style="text-align: center; margin: 30px 0;">
						<a href="${resetUrl}"
						   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
							Reset Password
						</a>
					</div>

					<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
						<p style="margin: 0; color: #856404;">
							<strong>Note:</strong> This link expires in 1 hour.
						</p>
					</div>

					<div style="color: #666; font-size: 14px; margin-top: 30px;">
						<p>If you didn't request a password reset, please ignore this email.</p>
						<p>If the link doesn't work, copy and paste the following URL into your browser:</p>
						<p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px;">${resetUrl}</p>
					</div>

					<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
						<p>© 2025 zxcv. All rights reserved.</p>
					</div>
				</div>
			`,
			text: `
zxcv - Password Reset

We received a request to reset your password.

Click the following link to set a new password:
${resetUrl}

Note: This link expires in 1 hour.

If you didn't request a password reset, please ignore this email.

--
© 2025 zxcv. All rights reserved.
			`.trim(),
		};
	}

	private getEmailVerificationContent(locale: string, verificationUrl: string) {
		const isJapanese = locale === "ja" || locale === "ja-JP";

		if (isJapanese) {
			return {
				subject: "【zxcv】メールアドレスの確認",
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
						<div style="text-align: center; margin-bottom: 30px;">
							<h1 style="color: #333; margin-bottom: 10px;">zxcv</h1>
							<p style="color: #666; font-size: 16px;">コーディングルール共有プラットフォーム</p>
						</div>

						<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
							<h2 style="color: #333; margin-top: 0;">メールアドレスの確認</h2>
							<p>zxcvへのご登録ありがとうございます。</p>
							<p>アカウントを有効化するため、下記のボタンをクリックしてメールアドレスを確認してください。</p>
						</div>

						<div style="text-align: center; margin: 30px 0;">
							<a href="${verificationUrl}"
							   style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
								メールアドレスを確認
							</a>
						</div>

						<div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
							<p style="margin: 0; color: #155724;">
								<strong>注意:</strong> このリンクは24時間後に期限切れになります。
							</p>
						</div>

						<div style="color: #666; font-size: 14px; margin-top: 30px;">
							<p>もしこのアカウントを作成していない場合は、このメールを無視してください。</p>
							<p>リンクが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
							<p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px;">${verificationUrl}</p>
						</div>

						<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
							<p>© 2025 zxcv. All rights reserved.</p>
						</div>
					</div>
				`,
				text: `
zxcv - メールアドレスの確認

zxcvへのご登録ありがとうございます。

アカウントを有効化するため、下記のリンクをクリックしてメールアドレスを確認してください：
${verificationUrl}

注意: このリンクは24時間後に期限切れになります。

もしこのアカウントを作成していない場合は、このメールを無視してください。

--
© 2025 zxcv. All rights reserved.
				`.trim(),
			};
		}

		// English version
		return {
			subject: "zxcv - Email Verification",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #333; margin-bottom: 10px;">zxcv</h1>
						<p style="color: #666; font-size: 16px;">Coding Rules Sharing Platform</p>
					</div>

					<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
						<h2 style="color: #333; margin-top: 0;">Email Verification</h2>
						<p>Thank you for signing up for zxcv!</p>
						<p>To activate your account, please click the button below to verify your email address.</p>
					</div>

					<div style="text-align: center; margin: 30px 0;">
						<a href="${verificationUrl}"
						   style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
							Verify Email Address
						</a>
					</div>

					<div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
						<p style="margin: 0; color: #155724;">
							<strong>Note:</strong> This link expires in 24 hours.
						</p>
					</div>

					<div style="color: #666; font-size: 14px; margin-top: 30px;">
						<p>If you didn't create this account, please ignore this email.</p>
						<p>If the link doesn't work, copy and paste the following URL into your browser:</p>
						<p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px;">${verificationUrl}</p>
					</div>

					<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
						<p>© 2025 zxcv. All rights reserved.</p>
					</div>
				</div>
			`,
			text: `
zxcv - Email Verification

Thank you for signing up for zxcv!

To activate your account, please click the following link to verify your email address:
${verificationUrl}

Note: This link expires in 24 hours.

If you didn't create this account, please ignore this email.

--
© 2025 zxcv. All rights reserved.
			`.trim(),
		};
	}

	private getTeamInvitationContent(
		locale: string,
		teamName: string,
		inviterName: string,
		invitationUrl: string,
	) {
		const isJapanese = locale === "ja" || locale === "ja-JP";

		if (isJapanese) {
			return {
				subject: `【zxcv】${teamName}への招待`,
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
						<div style="text-align: center; margin-bottom: 30px;">
							<h1 style="color: #333; margin-bottom: 10px;">zxcv</h1>
							<p style="color: #666; font-size: 16px;">コーディングルール共有プラットフォーム</p>
						</div>

						<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
							<h2 style="color: #333; margin-top: 0;">チームへの招待</h2>
							<p>${inviterName}さんから「${teamName}」チームへの招待が届きました。</p>
							<p>下記のボタンをクリックしてチームに参加してください。</p>
						</div>

						<div style="text-align: center; margin: 30px 0;">
							<a href="${invitationUrl}"
							   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
								チームに参加
							</a>
						</div>

						<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
							<p style="margin: 0; color: #856404;">
								<strong>注意:</strong> このリンクは7日後に期限切れになります。
							</p>
						</div>

						<div style="color: #666; font-size: 14px; margin-top: 30px;">
							<p>もし心当たりがない場合は、このメールを無視してください。</p>
							<p>リンクが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
							<p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px;">${invitationUrl}</p>
						</div>

						<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
							<p>© 2025 zxcv. All rights reserved.</p>
						</div>
					</div>
				`,
				text: `
zxcv - チームへの招待

${inviterName}さんから「${teamName}」チームへの招待が届きました。

下記のリンクをクリックしてチームに参加してください：
${invitationUrl}

注意: このリンクは7日後に期限切れになります。

もし心当たりがない場合は、このメールを無視してください。

--
© 2025 zxcv. All rights reserved.
				`.trim(),
			};
		}

		// English version
		return {
			subject: `zxcv - Invitation to ${teamName}`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #333; margin-bottom: 10px;">zxcv</h1>
						<p style="color: #666; font-size: 16px;">Coding Rules Sharing Platform</p>
					</div>

					<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
						<h2 style="color: #333; margin-top: 0;">Team Invitation</h2>
						<p>${inviterName} has invited you to join the "${teamName}" team.</p>
						<p>Click the button below to join the team.</p>
					</div>

					<div style="text-align: center; margin: 30px 0;">
						<a href="${invitationUrl}"
						   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
							Join Team
						</a>
					</div>

					<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
						<p style="margin: 0; color: #856404;">
							<strong>Note:</strong> This link expires in 7 days.
						</p>
					</div>

					<div style="color: #666; font-size: 14px; margin-top: 30px;">
						<p>If you didn't expect this invitation, please ignore this email.</p>
						<p>If the link doesn't work, copy and paste the following URL into your browser:</p>
						<p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px;">${invitationUrl}</p>
					</div>

					<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
						<p>© 2025 zxcv. All rights reserved.</p>
					</div>
				</div>
			`,
			text: `
zxcv - Team Invitation

${inviterName} has invited you to join the "${teamName}" team.

Click the following link to join the team:
${invitationUrl}

Note: This link expires in 7 days.

If you didn't expect this invitation, please ignore this email.

--
© 2025 zxcv. All rights reserved.
			`.trim(),
		};
	}
}
