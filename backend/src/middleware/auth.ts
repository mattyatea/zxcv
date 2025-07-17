import { ApiException } from "chanfana";
import type { MiddlewareHandler } from "hono";
import type { Env } from "../types/env";
import { verifyPassword } from "../utils/crypto";
import { createJWT as createJWTUtil, verifyJWT as verifyJWTUtil } from "../utils/jwt";
import { createPrismaClient } from "../utils/prisma";

export interface AuthUser {
	id: string;
	email: string;
	username: string;
}

export interface AuthContext {
	user?: AuthUser;
	apiKeyScopes?: string[];
}

export async function createJWT(user: AuthUser, env: Env): Promise<string> {
	return createJWTUtil(
		{
			sub: user.id,
			email: user.email,
			username: user.username,
		},
		env,
	);
}

export async function verifyJWT(token: string, env: Env): Promise<AuthUser | null> {
	const payload = await verifyJWTUtil(token, env);
	if (!payload) {
		return null;
	}

	return {
		id: payload.sub,
		email: payload.email,
		username: payload.username,
	};
}

async function verifyApiKey(
	apiKey: string,
	env: Env,
): Promise<{ user: AuthUser; scopes: string[] } | null> {
	const prisma = createPrismaClient(env.DB);
	const now = Math.floor(Date.now() / 1000);

	// Get all active API keys and verify against the provided key
	const activeApiKeys = await prisma.apiKey.findMany({
		where: {
			OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
		},
		include: {
			user: true,
		},
	});

	// Verify the API key against all stored hashes
	for (const storedApiKey of activeApiKeys) {
		const isValid = await verifyPassword(apiKey, storedApiKey.keyHash);
		if (isValid) {
			// Update last used timestamp
			await prisma.apiKey.update({
				where: { id: storedApiKey.id },
				data: { lastUsedAt: now },
			});

			const scopes = storedApiKey.scopes ? JSON.parse(storedApiKey.scopes) : [];
			return {
				user: {
					id: storedApiKey.user.id,
					email: storedApiKey.user.email,
					username: storedApiKey.user.username,
				},
				scopes,
			};
		}
	}

	return null;
}

export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: AuthContext }> = async (
	c,
	next,
) => {
	// Check for API key authentication first
	const apiKey = c.req.header("X-API-Key");
	if (apiKey) {
		try {
			const result = await verifyApiKey(apiKey, c.env);
			if (result) {
				c.set("user", result.user);
				c.set("apiKeyScopes", result.scopes);
			} else {
				// API key was provided but invalid - return 401
				return c.json({ error: "Invalid API key" }, 401);
			}
		} catch (_error) {
			// API key verification failed
			return c.json({ error: "Invalid API key" }, 401);
		}
	}

	// Check for JWT authentication if no API key was provided
	if (!c.get("user")) {
		const authHeader = c.req.header("Authorization");

		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.substring(7);
			const user = await verifyJWT(token, c.env);

			if (user) {
				c.set("user", user);
			}
		}
	}

	await next();
};

export const requireAuth: MiddlewareHandler<{ Bindings: Env; Variables: AuthContext }> = async (
	c,
	next,
) => {
	const user = c.get("user");

	if (!user) {
		throw new ApiException("Authentication required");
	}

	await next();
};

export const requireScope = (
	requiredScope: string,
): MiddlewareHandler<{ Bindings: Env; Variables: AuthContext }> => {
	return async (c, next) => {
		const apiKeyScopes = c.get("apiKeyScopes");

		// If no API key scopes are set, it means JWT authentication was used
		// JWT authentication has full access
		if (!apiKeyScopes) {
			await next();
			return;
		}

		// Check if the required scope is present in the API key scopes
		if (!apiKeyScopes.includes(requiredScope)) {
			return c.json({ error: "Insufficient scope" }, 403);
		}

		await next();
	};
};
