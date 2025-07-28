import type { ORPCErrorCode } from "@orpc/client";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ORPCError, onError } from "@orpc/server";
import type { H3Event, H3EventContext as BaseH3EventContext } from "h3";
import { defineEventHandler, getHeader, readRawBody, setHeader, setResponseStatus } from "h3";
import { router } from "~/server/orpc/router";
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

async function getAuthUser(event: H3Event): Promise<AuthUser | undefined> {
	const authorization = getHeader(event, "authorization");
	if (!authorization?.startsWith("Bearer ")) {
		return undefined;
	}

	const token = authorization.substring(7);
	const context = event.context as BaseH3EventContext & H3EventContext;
	const env = context.cloudflare.env;

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

const handler = new OpenAPIHandler(router, {
	// Enable error handling
	plugins: [],
	interceptors: [
		onError((error) => {
			console.log("oRPC onError interceptor:", {
				error,
				isORPCError: error instanceof ORPCError,
				code: (error as { code?: string })?.code,
				message: (error as { message?: string })?.message,
			});
			// Re-throw the error to let OpenAPIHandler process it
			throw error;
		}),
	],
});

export default defineEventHandler(async (event: H3Event) => {
	console.log("API handler called:", {
		method: event.node.req.method,
		url: event.node.req.url,
		path: event.path,
	});

	// In test environment, ensure context is properly set
	const context = event.context as BaseH3EventContext & H3EventContext;

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

	try {
		const user = await getAuthUser(event);

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

		const request = new Request(url, {
			method: event.node.req.method,
			headers,
			body: rawBody,
		});

		console.log("Request URL:", url.toString());
		console.log("Request method:", event.node.req.method);
		console.log("User authenticated:", !!user);

		let response: Awaited<ReturnType<typeof handler.handle>>;
		try {
			response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user,
					env: context.cloudflare.env,
					cloudflare: context.cloudflare,
				},
			});
		} catch (handlerError) {
			console.error("Handler error details:", {
				error: handlerError,
				message: (handlerError as { message?: string })?.message,
				code: (handlerError as { code?: string })?.code,
				stack: (handlerError as { stack?: string })?.stack,
				isORPCError: handlerError instanceof ORPCError,
			});
			throw handlerError;
		}

		console.log("Response matched:", response.matched);
		console.log("Response status:", response.response?.status);

		if (!response.matched) {
			setResponseStatus(event, 404, "Not Found");
			return { error: "Not found" };
		}

		// Send the fetch Response back through H3
		setResponseStatus(event, response.response.status);

		// Set response headers
		response.response.headers.forEach((value, key) => {
			setHeader(event, key, value);
		});

		// Return the response body
		const contentType = response.response.headers.get("content-type");
		if (contentType?.includes("application/json")) {
			return await response.response.json();
		}
		return await response.response.text();
	} catch (error) {
		console.error("OpenAPI Handler Error:", error);
		console.error("Error type:", error?.constructor?.name);
		console.error("Is ORPCError:", error instanceof ORPCError);

		// Check if the error has already been processed by OpenAPIHandler
		if (
			error &&
			typeof error === "object" &&
			"response" in error &&
			(error as { response?: unknown }).response instanceof Response
		) {
			const errorResponse = (error as { response: Response }).response;
			console.log("Error has Response object, status:", errorResponse.status);

			// Send the error response back through H3
			setResponseStatus(event, errorResponse.status);

			// Set response headers
			errorResponse.headers.forEach((value, key) => {
				setHeader(event, key, value);
			});

			// Return the error response body
			const contentType = errorResponse.headers.get("content-type");
			if (contentType?.includes("application/json")) {
				return await errorResponse.json();
			}
			return await errorResponse.text();
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
});
