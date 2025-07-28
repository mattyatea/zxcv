import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError } from "@orpc/server";
import type { H3Event, H3EventContext as BaseH3EventContext } from "h3";
import { getHeader, readRawBody, setHeader, setResponseStatus } from "h3";
import type { H3EventContext } from "~/server/types/bindings";
import type { Env } from "~/server/types/env";
import type { AuthUser } from "~/server/utils/auth";
import { verifyJWT } from "~/server/utils/jwt";

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
	if (!authorization?.startsWith("Bearer ")) {
		return undefined;
	}

	const token = authorization.substring(7);
	const context = event.context as BaseH3EventContext & H3EventContext;
	const env = context.cloudflare?.env;

	if (!env) {
		return undefined;
	}

	try {
		const payload = await verifyJWT(token, env);
		if (!payload) {
			return undefined;
		}
		return {
			id: payload.sub,
			email: payload.email,
			username: payload.username,
			emailVerified: payload.emailVerified || false,
		};
	} catch {
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

