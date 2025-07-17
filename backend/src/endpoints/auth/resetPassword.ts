import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { hashPassword } from "../../utils/crypto";
import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

export class ResetPasswordEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Reset password with token",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							token: z.string(),
							newPassword: z.string().min(8),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Password reset successfully",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string(),
						}),
					},
				},
			},
			"400": {
				description: "Invalid or expired token",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { token, newPassword } = data.body;

		const env = c.env as Env;
		const prisma = createPrismaClient(env.DB);
		const now = Math.floor(Date.now() / 1000);

		try {
			// Find valid reset token
			const reset = await prisma.passwordReset.findFirst({
				where: {
					token,
					expiresAt: { gt: now },
					usedAt: null,
				},
				select: {
					id: true,
					userId: true,
				},
			});

			if (!reset) {
				return c.json({ error: "Invalid or expired token" }, 400);
			}

			// Hash new password
			const passwordHash = await hashPassword(newPassword);

			// Update password and mark token as used sequentially (D1 doesn't support transactions)
			// Update user password first
			await prisma.user.update({
				where: { id: reset.userId },
				data: {
					passwordHash,
					updatedAt: now,
				},
			});

			try {
				// Mark token as used
				await prisma.passwordReset.update({
					where: { id: reset.id },
					data: {
						usedAt: now,
					},
				});
			} catch (_error) {
				// Ignore error if token cleanup fails
			}

			return c.json({
				message: "Password reset successfully",
			});
		} catch (error) {
			const prismaError = handlePrismaError(error);
			return c.json({ error: prismaError.message }, prismaError.status);
		}
	}
}
