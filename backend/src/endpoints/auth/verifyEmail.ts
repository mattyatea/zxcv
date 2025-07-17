import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { EmailVerificationService } from "../../services/emailVerification";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";

const verifyEmailSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export class VerifyEmailRoute extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Verify email address",
		description: "Verify user's email address using verification token",
		request: {
			body: {
				content: {
					"application/json": {
						schema: verifyEmailSchema,
					},
				},
			},
		},
		responses: {
			200: {
				description: "Email verified successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							userId: z.string().optional(),
						}),
					},
				},
			},
			400: {
				description: "Invalid or expired token",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
						}),
					},
				},
			},
			500: {
				description: "Internal server error",
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
			const { token } = verifyEmailSchema.parse(body);

			const prisma = createPrismaClient(env.DB);
			const emailVerificationService = new EmailVerificationService(prisma, env);

			// Verify email
			const result = await emailVerificationService.verifyEmail(token);

			if (result.success) {
				return {
					success: true,
					message: "Email verified successfully",
					userId: result.userId,
				};
			}

			return new Response(
				JSON.stringify({
					success: false,
					message: result.message || "Email verification failed",
				}),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
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
