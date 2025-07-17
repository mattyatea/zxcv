import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { EmailVerificationService } from "../../services/emailVerification";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";

const sendVerificationSchema = z.object({
	email: z.string().email("Valid email address is required"),
	locale: z.string().optional(),
});

export class SendVerificationRoute extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Send email verification",
		description: "Send an email verification link to the user's email address",
		request: {
			body: {
				content: {
					"application/json": {
						schema: sendVerificationSchema,
					},
				},
			},
		},
		responses: {
			200: {
				description: "Verification email sent successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
						}),
					},
				},
			},
			400: {
				description: "Invalid request",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
						}),
					},
				},
			},
			429: {
				description: "Too many requests",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(request: Request, env: Env, _ctx: any) {
		try {
			const body = await request.json();
			const { email, locale } = sendVerificationSchema.parse(body);

			const prisma = createPrismaClient(env.DB);
			const emailVerificationService = new EmailVerificationService(prisma, env);

			// Send verification email (returns true even if email doesn't exist for security)
			const sent = await emailVerificationService.resendVerificationEmail(email, locale);

			if (sent) {
				return {
					success: true,
					message:
						"If this email address exists and is not already verified, a verification email has been sent.",
				};
			}

			return {
				success: false,
				message: "Failed to send verification email. Please try again.",
			};
		} catch (error) {
			if (error instanceof z.ZodError) {
				return new Response(
					JSON.stringify({
						success: false,
						message: error.errors[0]?.message || "Invalid request data",
					}),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}

			return new Response(
				JSON.stringify({
					success: false,
					message: "Internal server error",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}
	}
}
