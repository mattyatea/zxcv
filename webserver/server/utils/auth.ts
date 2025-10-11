import {
	type H3EventContext as BaseH3EventContext,
	createError,
	getHeader,
	type H3Event,
} from "h3";
import type { H3EventContext } from "../types/bindings";
import type { Env } from "../types/env";
import { verifyPassword } from "./crypto";
import { createJWT as createJWTUtil, verifyJWT as verifyJWTUtil } from "./jwt";
import { createPrismaClient } from "./prisma";

export interface AuthUser {
	id: string;
	email: string;
	username: string;
	role: string;
	emailVerified: boolean;
	displayName: string | null;
	avatarUrl: string | null;
}

export interface AuthContext {
	user?: AuthUser;
	apiKeyScopes?: string[];
}

async function createJWT(user: AuthUser, env: Env): Promise<string> {
	return createJWTUtil(
		{
			sub: user.id,
			email: user.email,
			username: user.username,
			role: user.role,
			emailVerified: user.emailVerified,
		},
		env,
	);
}

async function verifyJWT(token: string, env: Env): Promise<AuthUser | null> {
	const payload = await verifyJWTUtil(token, env);
	if (!payload) {
		return null;
	}

	return {
		id: payload.sub,
		email: payload.email,
		username: payload.username,
		role: payload.role ?? "user",
		emailVerified: payload.emailVerified || false,
		displayName: payload.displayName || null,
		avatarUrl: payload.avatarUrl || null,
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
					role: storedApiKey.user.role,
					emailVerified: storedApiKey.user.emailVerified,
					displayName: storedApiKey.user.displayName,
					avatarUrl: storedApiKey.user.avatarUrl,
				},
				scopes,
			};
		}
	}

	return null;
}

export async function getAuthFromEvent(event: H3Event): Promise<AuthContext> {
	const context = event.context as BaseH3EventContext & H3EventContext;
	const env = context.cloudflare.env;
	const authContext: AuthContext = {};

	// Check for API key authentication first
	const apiKey = getHeader(event, "x-api-key");
	if (apiKey) {
		try {
			const result = await verifyApiKey(apiKey, env);
			if (result) {
				authContext.user = result.user;
				authContext.apiKeyScopes = result.scopes;
			}
		} catch (_error) {
			// API key verification failed - continue to JWT check
		}
	}

	// Check for JWT authentication if no API key was provided
	if (!authContext.user) {
		const authHeader = getHeader(event, "authorization");

		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.substring(7);
			const user = await verifyJWT(token, env);

			if (user) {
				authContext.user = user;
			}
		}
	}

	return authContext;
}

export async function requireAuth(event: H3Event): Promise<AuthUser> {
	const auth = await getAuthFromEvent(event);

	if (!auth.user) {
		throw createError({
			statusCode: 401,
			statusMessage: "Authentication required",
		});
	}

	return auth.user;
}

export async function requireEmailVerification(event: H3Event): Promise<AuthUser> {
	const user = await requireAuth(event);

	if (!user.emailVerified) {
		throw createError({
			statusCode: 403,
			statusMessage:
				"Email verification required. Please verify your email address to access this resource.",
		});
	}

	return user;
}

export async function requireScope(event: H3Event, requiredScope: string): Promise<void> {
	const auth = await getAuthFromEvent(event);

	if (!auth.user) {
		throw createError({
			statusCode: 401,
			statusMessage: "Authentication required",
		});
	}

	// If no API key scopes are set, it means JWT authentication was used
	// JWT authentication has full access
	if (!auth.apiKeyScopes) {
		return;
	}

	// Check if the required scope is present in the API key scopes
	if (!auth.apiKeyScopes.includes(requiredScope)) {
		throw createError({
			statusCode: 403,
			statusMessage: "Insufficient scope",
		});
	}
}
