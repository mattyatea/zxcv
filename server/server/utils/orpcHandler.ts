import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError } from "@orpc/server";
import type { H3EventContext as BaseH3EventContext, H3Event } from "h3";
import { getHeader, readRawBody, setHeader, setResponseStatus } from "h3";
import type { H3EventContext } from "../types/bindings";
import type { Env } from "../types/env";
import type { AuthUser } from "./auth";
import { verifyJWT } from "./jwt";

// Extend globalThis for test environment
declare global {
	var DB: D1Database | undefined;
	var R2: R2Bucket | undefined;
	var EMAIL_SENDER: SendEmail | undefined;
	var KV_CACHE: KVNamespace | undefined;
	var JWT_SECRET: string | undefined;
}

export async function getAuthUser(event: H3Event): Promise<AuthUser | undefined> {
	const authorization = getHeader(event, "authorization");
	console.log(
		"Authorization header:",
		authorization ? `Bearer ${authorization.substring(7, 27)}...` : "None",
	);

	if (!authorization?.startsWith("Bearer ")) {
		console.log("No valid Bearer token found");
		return undefined;
	}

	const token = authorization.substring(7);
	console.log("Token extracted, length:", token.length);
	const context = event.context as BaseH3EventContext & H3EventContext;
	const env = context.cloudflare?.env;

	// Log only essential environment info to avoid circular reference
	console.log("Environment info:", {
		hasJwtSecret: !!env?.JWT_SECRET,
		jwtAlgorithm: env?.JWT_ALGORITHM,
		hasDb: !!env?.DB,
	});

	if (!env) {
		return undefined;
	}

	// Check if it's a CLI token - JWT has 3 parts separated by dots, CLI tokens don't
	const isJWT = token.split(".").length === 3;
	if (!isJWT && token.length > 100) {
		console.log("Processing as CLI token (not JWT format && length > 100)");
		// Import dynamically to avoid circular dependencies
		const { hashCliToken } = await import("./deviceAuth");
		const { createPrismaClient } = await import("./prisma");

		try {
			const tokenHash = await hashCliToken(token);
			console.log("CLI token hash generated");

			const db = createPrismaClient(env.DB);
			const cliToken = await db.cliToken.findUnique({
				where: { tokenHash },
				include: { user: true },
			});

			if (!cliToken || !cliToken.user) {
				console.log("CLI token not found in database");
				return undefined;
			}

			// Check if token is expired
			if (cliToken.expiresAt && cliToken.expiresAt < Math.floor(Date.now() / 1000)) {
				console.log("CLI token expired");
				return undefined;
			}

			console.log("CLI token valid for user:", cliToken.user.username);

			// Update last used timestamp
			await db.cliToken.update({
				where: { id: cliToken.id },
				data: { lastUsedAt: Math.floor(Date.now() / 1000) },
			});

			return {
				id: cliToken.user.id,
				email: cliToken.user.email,
				username: cliToken.user.username,
				emailVerified: cliToken.user.emailVerified,
			};
		} catch (error) {
			console.error(
				"CLI token processing error:",
				error instanceof Error ? error.message : String(error),
			);
			return undefined;
		}
	} else {
		console.log("Processing as JWT token (JWT format detected)");
	}

	// Standard JWT token
	try {
		const payload = await verifyJWT(token, env);
		if (!payload) {
			console.log("JWT verification returned null payload");
			return undefined;
		}
		console.log("JWT verification successful for user:", payload.username);
		return {
			id: payload.sub,
			email: payload.email,
			username: payload.username,
			emailVerified: payload.emailVerified || false,
		};
	} catch (error) {
		console.error("JWT verification failed:", {
			error: error instanceof Error ? error.message : String(error),
			tokenLength: token.length,
			tokenStart: `${token.substring(0, 20)}...`,
		});
		return undefined;
	}
}

export function ensureCloudflareContext(event: H3Event): void {
	const context = event.context as BaseH3EventContext & Partial<H3EventContext>;

	// Ensure cloudflare context exists
	if (!context.cloudflare) {
		// In test environment, set up minimal cloudflare context
		const testEnv = {
			DB: globalThis.DB || undefined,
			R2: globalThis.R2 || undefined,
			EMAIL_SENDER: globalThis.EMAIL_SENDER || undefined,
			KV_CACHE: globalThis.KV_CACHE || undefined,
			JWT_SECRET: globalThis.JWT_SECRET || "test-secret",
			JWT_ALGORITHM: "HS256",
			JWT_EXPIRES_IN: "1h",
			EMAIL_FROM: "test@example.com",
			FRONTEND_URL: "http://localhost:3000",
			RATE_LIMIT_ANONYMOUS: "100",
			RATE_LIMIT_AUTHENTICATED: "1000",
			RATE_LIMIT_API_KEY: "5000",
		} as Env;

		context.cloudflare = {
			env: testEnv,
			context: {
				waitUntil: () => {
					// No-op for test environment
				},
				passThroughOnException: () => {
					// No-op for test environment
				},
				props: {},
			} as ExecutionContext,
			// biome-ignore lint/suspicious/noExplicitAny: Type mismatch between Node's Request and Cloudflare's Request
			request: new Request("http://localhost") as any,
		};
	}
}

export async function createRequestFromEvent(event: H3Event): Promise<Request> {
	// Convert H3 event to a standard Request object for the fetch adapter
	const url = new URL(
		event.node.req.url || "",
		`http://${event.node.req.headers.host || "localhost"}`,
	);
	const headers = new Headers();

	// Copy headers from the H3 event
	for (const [key, value] of Object.entries(event.node.req.headers)) {
		if (value) {
			headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
		}
	}

	// Create a Request object
	const rawBody =
		event.node.req.method !== "GET" && event.node.req.method !== "HEAD"
			? await readRawBody(event)
			: undefined;

	return new Request(url, {
		method: event.node.req.method,
		headers,
		body: rawBody,
	});
}

// biome-ignore lint/suspicious/noExplicitAny: Return type varies based on response content type
export async function sendResponse(event: H3Event, response: Response): Promise<any> {
	// Send the fetch Response back through H3
	setResponseStatus(event, response.status);

	// Set response headers
	response.headers.forEach((value, key) => {
		setHeader(event, key, value);
	});

	// Return the response body
	const contentType = response.headers.get("content-type");
	if (contentType?.includes("application/json")) {
		return await response.json();
	}
	return await response.text();
}

// biome-ignore lint/suspicious/noExplicitAny: Error response format varies and needs to be flexible
export async function handleError(event: H3Event, error: unknown): Promise<any> {
	console.error("Handler Error:", error);
	console.error("Error type:", error?.constructor?.name);
	console.error("Is ORPCError:", error instanceof ORPCError);

	// Check if the error has already been processed by Handler
	if (
		error &&
		typeof error === "object" &&
		"response" in error &&
		(error as { response?: unknown }).response instanceof Response
	) {
		const errorResponse = (error as { response: Response }).response;
		console.log("Error has Response object, status:", errorResponse.status);
		return sendResponse(event, errorResponse);
	}

	// Handle ORPCError specifically to preserve status codes
	if (
		error instanceof ORPCError ||
		(error && typeof error === "object" && "code" in error && "__isORPCError" in error)
	) {
		const orpcError = error as ORPCError<ORPCErrorCode, unknown>;
		console.log("Handling ORPCError:", { code: orpcError.code, message: orpcError.message });

		const statusMap: Record<string, number> = {
			UNAUTHORIZED: 401,
			FORBIDDEN: 403,
			NOT_FOUND: 404,
			BAD_REQUEST: 400,
			CONFLICT: 409,
			INTERNAL_SERVER_ERROR: 500,
		};

		const status = statusMap[orpcError.code] || 500;
		setResponseStatus(event, status);

		return {
			defined: false,
			code: orpcError.code,
			status,
			message: orpcError.message || "An error occurred",
			data: orpcError.data,
		};
	}

	// For other errors, return 500
	console.error("Unhandled error type, returning 500");
	setResponseStatus(event, 500);
	return {
		defined: false,
		code: "INTERNAL_SERVER_ERROR",
		status: 500,
		message: "Internal server error",
	};
}
