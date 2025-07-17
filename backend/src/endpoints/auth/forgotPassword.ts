import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { generateId } from "../../utils/crypto";
import { EmailService } from "../../utils/email";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class ForgotPasswordEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Request password reset",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							email: z.string().email(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Password reset email sent",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { email } = data.body;

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);

		try {
			// Check if user exists
			const user = await prisma.user.findUnique({
				where: { email },
				select: { id: true },
			});

			// Always return success to prevent email enumeration
			if (user) {
				// Generate reset token
				const resetToken = generateId();
				const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour
				const now = Math.floor(Date.now() / 1000);

				// Store reset token in database
				await prisma.passwordReset.create({
					data: {
						id: generateId(),
						userId: user.id,
						token: resetToken,
						expiresAt,
						createdAt: now,
					},
				});

				// Send password reset email
				const emailService = new EmailService(env);
				const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

				// Use default locale for now
				const userLocale = "en";

				const emailTemplate = emailService.generatePasswordResetEmail({
					email,
					resetToken,
					resetUrl,
					userLocale,
				});

				const emailSent = await emailService.sendEmail(emailTemplate);

				if (!emailSent) {
					// Log error without exposing email address
					// Continue execution to prevent email enumeration
				}
			}

			return c.json({
				message: "If an account exists with this email, a password reset link has been sent.",
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
