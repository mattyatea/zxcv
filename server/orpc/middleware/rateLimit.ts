import { ORPCError } from "@orpc/server";
import { os } from "~/server/orpc";
import { authErrors, type Locale } from "~/server/utils/i18n";
import { createPrismaClient } from "~/server/utils/prisma";

export interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Maximum number of requests per window
	keyPrefix: string; // Prefix for the rate limit key
}

/**
 * Creates a rate limit middleware that also provides database access
 * This is a combined middleware that handles both DB and rate limiting
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
	return os.middleware(async ({ context, next }) => {
		// Use existing db from context if available (for testing), otherwise create new one
		const db = (context as any).db || createPrismaClient(context.env.DB);
		const { env } = context;
		const { windowMs, maxRequests, keyPrefix } = config;

		// Get client identifier (IP address or user ID)
		const clientId = getClientIdentifier(context);
		const key = `${keyPrefix}:${clientId}`;
		const now = Math.floor(Date.now() / 1000);
		const windowStart = Math.floor((Date.now() - windowMs) / 1000);

		try {
			// Get or create rate limit record
			const rateLimitRecord = await db.rateLimit.findUnique({
				where: { key },
			});

			if (rateLimitRecord) {
				// Check if window has expired
				if (rateLimitRecord.resetAt <= now) {
					// Reset the counter
					await db.rateLimit.update({
						where: { key },
						data: {
							count: 1,
							resetAt: Math.floor((Date.now() + windowMs) / 1000),
						},
					});
				} else {
					// Check if limit exceeded
					if (rateLimitRecord.count >= maxRequests) {
						const retryAfter = rateLimitRecord.resetAt - now;
						const locale: Locale = "ja"; // Default to Japanese for now
						throw new ORPCError("TOO_MANY_REQUESTS", {
							message: authErrors.rateLimit(locale, retryAfter),
						});
					}

					// Increment counter
					await db.rateLimit.update({
						where: { key },
						data: {
							count: { increment: 1 },
						},
					});
				}
			} else {
				// Create new rate limit record
				await db.rateLimit.create({
					data: {
						key,
						count: 1,
						resetAt: Math.floor((Date.now() + windowMs) / 1000),
					},
				});
			}

			// Clean up old records periodically (1% chance)
			if (Math.random() < 0.01) {
				await db.rateLimit.deleteMany({
					where: {
						resetAt: { lt: now },
					},
				});
			}

			// Continue to next middleware with db in context
			return next({
				context: {
					...context,
					db,
				},
			});
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			console.error("Rate limit middleware error:", error);
			// On error, allow the request to proceed
			return next({
				context: {
					...context,
					db,
				},
			});
		}
	});
}

/**
 * Get client identifier from context
 * In a real-world scenario, this would extract IP from headers
 */
function getClientIdentifier(context: any): string {
	// Check if user is authenticated
	if ("user" in context && context.user?.id) {
		return `user:${context.user.id}`;
	}

	// In Cloudflare Workers, we can get CF headers
	// For now, use a placeholder
	// In production, you'd extract from request headers like CF-Connecting-IP
	return "anonymous:default";
}

// Pre-configured rate limiters for common use cases
export const authRateLimit = createRateLimitMiddleware({
	windowMs: 15 * 60 * 1000, // 15 minutes
	maxRequests: 5, // 5 requests per 15 minutes
	keyPrefix: "auth",
});

export const apiRateLimit = createRateLimitMiddleware({
	windowMs: 60 * 1000, // 1 minute
	maxRequests: 60, // 60 requests per minute
	keyPrefix: "api",
});
