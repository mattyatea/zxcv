import { EmailMessage } from "cloudflare:email";
import type { Env, SendEmailBinding } from "../types/env";

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

export class EmailService {
	private fromEmail: string;
	private baseUrl: string;
	private emailSender: SendEmailBinding;

	constructor(env: Env) {
		this.fromEmail = env.EMAIL_FROM || "noreply@zxcv.dev";
		this.baseUrl = env.FRONTEND_URL || "https://zxcv.dev";
		this.emailSender = env.EMAIL_SENDER;
	}

	async sendEmail(template: EmailTemplate): Promise<boolean> {
		try {
			// Create a simple MIME message manually without mimetext
			const boundary = `----formdata-${Date.now()}`;

			const mimeMessage = [
				`From: ZXCV <${this.fromEmail}>`,
				`To: ${template.to}`,
				`Subject: ${template.subject}`,
				"MIME-Version: 1.0",
				`Content-Type: multipart/alternative; boundary="${boundary}"`,
				"",
				`--${boundary}`,
				"Content-Type: text/plain; charset=utf-8",
				"Content-Transfer-Encoding: quoted-printable",
				"",
				template.text,
				"",
				`--${boundary}`,
				"Content-Type: text/html; charset=utf-8",
				"Content-Transfer-Encoding: quoted-printable",
				"",
				template.html,
				"",
				`--${boundary}--`,
			].join("\r\n");

			// Create EmailMessage
			const emailMessage = new EmailMessage(this.fromEmail, template.to, mimeMessage);

			// Send email using Cloudflare Email Workers
			await this.emailSender.send(emailMessage);

			return true;
		} catch (_error) {
			// console.error("Email sending error:", error);
			return false;
		}
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

	private getPasswordResetContent(locale: string, resetUrl: string) {
		const isJapanese = locale === "ja" || locale === "ja-JP";

		if (isJapanese) {
			return {
				subject: "【ZXCV】パスワードリセットのお知らせ",
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
						<div style="text-align: center; margin-bottom: 30px;">
							<h1 style="color: #333; margin-bottom: 10px;">ZXCV</h1>
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
							<p>© 2025 ZXCV. All rights reserved.</p>
						</div>
					</div>
				`,
				text: `
ZXCV - パスワードリセット

パスワードリセットのリクエストを受け付けました。

下記のリンクをクリックして新しいパスワードを設定してください：
${resetUrl}

注意: このリンクは1時間後に期限切れになります。

もしパスワードリセットを依頼していない場合は、このメールを無視してください。

--
© 2025 ZXCV. All rights reserved.
				`.trim(),
			};
		}

		// English version
		return {
			subject: "ZXCV - Password Reset",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #333; margin-bottom: 10px;">ZXCV</h1>
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
						<p>© 2025 ZXCV. All rights reserved.</p>
					</div>
				</div>
			`,
			text: `
ZXCV - Password Reset

We received a request to reset your password.

Click the following link to set a new password:
${resetUrl}

Note: This link expires in 1 hour.

If you didn't request a password reset, please ignore this email.

--
© 2025 ZXCV. All rights reserved.
			`.trim(),
		};
	}
}
