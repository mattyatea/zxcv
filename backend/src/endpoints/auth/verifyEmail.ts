import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { EmailVerificationService } from "../../services/emailVerification";
import type { AppContext } from "../../types";
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

	async handle(c: AppContext) {
		try {
			const data = await this.getValidatedData<typeof this.schema>();
			const { token } = data.body;

			const env = c.env as Env;
			const prisma = createPrismaClient(env.DB);
			const emailVerificationService = new EmailVerificationService(prisma, env);

			// Verify email
			const result = await emailVerificationService.verifyEmail(token);

			if (result.success) {
				return c.json({
					success: true,
					message: "Email verified successfully",
					userId: result.userId,
				});
			}

			return c.json(
				{
					success: false,
					message: result.message || "Email verification failed",
				},
				400,
			);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return c.json(
					{
						success: false,
						message: error.errors[0]?.message || "Invalid request data",
					},
					400,
				);
			}

			return c.json(
				{
					success: false,
					message: "Internal server error",
				},
				500,
			);
		}
	}
}
