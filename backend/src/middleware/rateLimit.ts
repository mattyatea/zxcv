import { ApiException } from "chanfana";
import type { MiddlewareHandler } from "hono";
import type { Env } from "../types/env";
import { createPrismaClient } from "../utils/prisma";
import type { AuthContext } from "./auth";

// interface RateLimitEntry {
//	count: number;
//	resetAt: number;
// }

const WINDOW_MS = 3600000; // 1 hour in milliseconds

export const rateLimitMiddleware: MiddlewareHandler<{
	Bindings: Env;
	Variables: AuthContext;
}> = async (c, next) => {
	const user = c.get("user");
	const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown";
	const endpoint = c.req.path;

	// Determine rate limit based on authentication status
	let limit: number;
	let key: string;

	if (user) {
		limit = Number.parseInt(c.env.RATE_LIMIT_AUTHENTICATED);
		key = `rate_limit:user:${user.id}:${endpoint}`;
	} else {
		limit = Number.parseInt(c.env.RATE_LIMIT_ANONYMOUS);
		key = `rate_limit:ip:${ip}:${endpoint}`;
	}

	const now = Date.now();
	const resetAt = now + WINDOW_MS;
	const prisma = createPrismaClient(c.env.DB);

	try {
		// Get current rate limit data
		const result = await prisma.rateLimit.findFirst({
			where: {
				key,
				resetAt: {
					gt: now,
				},
			},
		});

		let count = 1;

		if (result) {
			count = result.count + 1;

			if (count > limit) {
				const retryAfter = Math.ceil((result.resetAt - now) / 1000);
				c.header("Retry-After", retryAfter.toString());
				c.header("X-RateLimit-Limit", limit.toString());
				c.header("X-RateLimit-Remaining", "0");
				c.header("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000).toString());

				throw new ApiException("Too Many Requests");
			}

			// Update count
			await prisma.rateLimit.update({
				where: { key },
				data: { count },
			});
		} else {
			// Insert new entry or update existing expired entry
			await prisma.rateLimit.upsert({
				where: { key },
				update: {
					count,
					resetAt,
				},
				create: {
					key,
					count,
					resetAt,
				},
			});
		}

		// Set rate limit headers
		c.header("X-RateLimit-Limit", limit.toString());
		c.header("X-RateLimit-Remaining", (limit - count).toString());
		c.header("X-RateLimit-Reset", Math.ceil(resetAt / 1000).toString());

		await next();
	} catch (error) {
		// If it's already an ApiException (rate limit exceeded), re-throw it
		if (error instanceof ApiException) {
			throw error;
		}

		// Log other errors but don't block the request
		// console.error("Rate limit middleware error:", error);
		await next();
	}
};
