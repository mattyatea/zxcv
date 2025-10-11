import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import type { H3EventContext as BaseH3EventContext, H3Event } from "h3";
import { defineEventHandler, getHeader, readRawBody, setHeader, setResponseStatus } from "h3";
import { router } from "../../orpc/router";
import type { H3EventContext } from "../../types/bindings";
import type { Env } from "../../types/env";
import type { AuthUser } from "../../utils/auth";
import { verifyJWT } from "../../utils/jwt";
import { createLogger } from "../../utils/logger";

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
			role: payload.role ?? "user",
			emailVerified: payload.emailVerified || false,
			displayName: payload.displayName || null,
			avatarUrl: payload.avatarUrl || null,
		};
	} catch {
		return undefined;
	}
}

export default defineEventHandler(async (event: H3Event) => {
	// Get environment from context first to initialize logger properly
	const context = event.context as BaseH3EventContext & H3EventContext;
	const env = context.cloudflare?.env as Env;
	const logger = createLogger(env);

	logger.debug("RPC handler called", {
		method: event.node.req.method,
		url: event.node.req.url,
		path: event.path,
		environment: env?.ENVIRONMENT || "unknown",
	});

	const handler = new RPCHandler(router, {
		plugins: [],
		interceptors: [
			onError((error: unknown) => {
				const errorLogger = createLogger(env);

				// Type-safe error handling
				const errorInfo = {
					isORPCError: error instanceof ORPCError,
					code: error instanceof ORPCError ? error.code : undefined,
					errorMessage: error instanceof Error ? error.message : String(error),
				};

				errorLogger.error(
					"oRPC error interceptor",
					error instanceof Error ? error : undefined,
					errorInfo,
				);

				// Re-throw the error to let RPCHandler process it
				throw error;
			}),
		],
	});

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
			request: new Request("http://localhost") as Request & { cf: IncomingRequestCfProperties },
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

		logger.debug("Processing RPC request", {
			url: url.toString(),
			method: event.node.req.method,
			userAuthenticated: !!user,
		});

		let response: Awaited<ReturnType<typeof handler.handle>>;
		try {
			response = await handler.handle(request, {
				prefix: "/rpc",
				context: {
					user,
					env: context.cloudflare.env,
					cloudflare: context.cloudflare,
				},
			});
		} catch (handlerError) {
			logger.error("Handler error occurred", handlerError as Error, {
				message: (handlerError as { message?: string })?.message,
				code: (handlerError as { code?: string })?.code,
				isORPCError: handlerError instanceof ORPCError,
			});
			throw handlerError;
		}

		logger.debug("RPC response details", {
			matched: response.matched,
			status: response.response?.status,
		});

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
		logger.error("RPC Handler Error", error as Error, {
			errorType: error?.constructor?.name,
			isORPCError: error instanceof ORPCError,
		});

		// Check if the error has already been processed by RPCHandler
		if (
			error &&
			typeof error === "object" &&
			"response" in error &&
			(error as { response?: unknown }).response instanceof Response
		) {
			const errorResponse = (error as { response: Response }).response;
			logger.debug("Error has Response object", { status: errorResponse.status });

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
			logger.error("Handling ORPCError", undefined, {
				code: orpcError.code,
				message: orpcError.message,
			});

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
		logger.error("Unhandled error type, returning 500", error as Error);
		setResponseStatus(event, 500);
		return {
			defined: false,
			code: "INTERNAL_SERVER_ERROR",
			status: 500,
			message: "Internal server error",
		};
	}
});
