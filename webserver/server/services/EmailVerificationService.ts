import type { PrismaClient } from "@prisma/client";
import type { Env } from "../types/env";
import { generateId } from "../utils/crypto";
import { EmailService, type EmailVerificationData } from "../utils/email";

export class EmailVerificationService {
	private prisma: PrismaClient;
	private emailService: EmailService;
	private env: Env;

	constructor(prisma: PrismaClient, env: Env) {
		this.prisma = prisma;
		this.emailService = new EmailService(env);
		this.env = env;
	}

	async createVerificationToken(userId: string): Promise<string> {
		const token = generateId();
		const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours from now

		await this.prisma.emailVerification.create({
			data: {
				id: generateId(),
				userId,
				token,
				expiresAt,
			},
		});

		return token;
	}

	async sendVerificationEmail(
		userId: string,
		email: string,
		userLocale?: string,
	): Promise<boolean> {
		try {
			// Create verification token
			const token = await this.createVerificationToken(userId);

			// Generate email template
			const emailData: EmailVerificationData = {
				email,
				verificationToken: token,
				verificationUrl: `${this.env.APP_URL || this.env.FRONTEND_URL || "https://zxcv.dev"}/verifyemail?token=${token}`,
				userLocale,
			};

			const emailTemplate =
				this.emailService.generateEmailVerificationEmail(emailData);

			// Send email
			return await this.emailService.sendEmail(emailTemplate);
		} catch (_error) {
			return false;
		}
	}

	async verifyEmail(token: string): Promise<{
		success: boolean;
		userId?: string;
		message?: string;
	}> {
		try {
			// Find verification token
			const verification = await this.prisma.emailVerification.findUnique({
				where: { token },
				include: { user: true },
			});

			if (!verification) {
				return { success: false, message: "Invalid verification token" };
			}

			// Check if token is expired
			const now = Math.floor(Date.now() / 1000);
			if (verification.expiresAt < now) {
				return { success: false, message: "Verification token has expired" };
			}

			// Check if token is already used
			if (verification.usedAt) {
				return {
					success: false,
					message: "Verification token has already been used",
				};
			}

			// Mark token as used and update user email verification status
			// Execute updates sequentially instead of transaction
			await this.prisma.emailVerification.update({
				where: { id: verification.id },
				data: { usedAt: now },
			});

			await this.prisma.user.update({
				where: { id: verification.userId },
				data: { emailVerified: true },
			});

			return { success: true, userId: verification.userId };
		} catch (_error) {
			return { success: false, message: "Internal server error" };
		}
	}

	async resendVerificationEmail(
		email: string,
		userLocale?: string,
	): Promise<boolean> {
		try {
			// Find user by email
			const user = await this.prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				// Don't reveal if email exists or not for security
				return true;
			}

			// Check if user is already verified
			if (user.emailVerified) {
				return true;
			}

			// Invalidate any existing tokens for this user
			await this.prisma.emailVerification.updateMany({
				where: {
					userId: user.id,
					usedAt: null,
				},
				data: {
					usedAt: Math.floor(Date.now() / 1000),
				},
			});

			// Send new verification email
			return await this.sendVerificationEmail(user.id, email, userLocale);
		} catch (_error) {
			return false;
		}
	}
}
