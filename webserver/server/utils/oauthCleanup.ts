import type { PrismaClient } from "@prisma/client";

/**
 * Clean up expired OAuth states to prevent database bloat
 * This should be called periodically (e.g., via a cron job or before each OAuth flow)
 */
export async function cleanupExpiredOAuthStates(db: PrismaClient): Promise<number> {
	const now = Math.floor(Date.now() / 1000);

	try {
		const result = await db.oAuthState.deleteMany({
			where: {
				expiresAt: {
					lt: now,
				},
			},
		});

		return result.count;
	} catch (error) {
		console.error("Failed to cleanup expired OAuth states:", error);
		return 0;
	}
}
