import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import { apiKeysRouter } from "./endpoints/api-keys/router";
import { authRouter } from "./endpoints/auth/router";
import { HealthCheckEndpoint } from "./endpoints/health";
import { rulesRouter } from "./endpoints/rules/router";
import { teamsRouter } from "./endpoints/teams/router";
import { usersRouter } from "./endpoints/users/router";
import type { AuthContext } from "./middleware/auth";
import { authMiddleware } from "./middleware/auth";
import { rateLimitMiddleware } from "./middleware/rateLimit";
import { corsMiddleware, requestIdMiddleware, securityHeaders } from "./middleware/security";
import type { Env } from "./types/env";
import { createLogger, requestTimingMiddleware } from "./utils/logger";

// Start a Hono app
const app = new Hono<{ Bindings: Env; Variables: AuthContext }>();

app.onError((err, c) => {
	const logger = createLogger(c.env as Env);

	if (err instanceof ApiException) {
		logger.warn("API exception occurred", {
			status: err.status,
			errors: err.buildResponse(),
		});
		// If it's a Chanfana ApiException, let Chanfana handle the response
		return c.json(
			{ success: false, errors: err.buildResponse() },
			err.status as ContentfulStatusCode,
		);
	}

	if (err instanceof ZodError) {
		logger.warn("Validation error occurred", {
			errors: err.errors,
		});
		// Handle Zod validation errors
		return c.json(
			{
				success: false,
				errors: err.errors.map((e) => ({
					code: 1001,
					message: `${e.path.join(".")} - ${e.message}`,
				})),
			},
			400,
		);
	}

	logger.error("Unhandled error occurred", err, {
		url: c.req.url,
		method: c.req.method,
	});

	// For other errors, return a generic 500 response
	return c.json(
		{
			success: false,
			errors: [{ code: 7000, message: "Internal Server Error" }],
		},
		500,
	);
});

// Apply global middleware
app.use("*", requestIdMiddleware());
app.use("*", securityHeaders());
app.use("*", corsMiddleware(["https://zxcv.dev", "http://localhost:3000"]));
// app.use("*", inputValidationMiddleware()); // TODO: Fix validation to not break tests
app.use("*", requestTimingMiddleware());
app.use("*", authMiddleware);
app.use("*", rateLimitMiddleware);

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
	schema: {
		info: {
			title: "zxcv - Rule Management API",
			version: "1.0.0",
			description: "API for managing and sharing coding rules and guidelines",
		},
	},
});

// Register Health check endpoint
openapi.get("/health", HealthCheckEndpoint);

// Register API Keys router
openapi.route("/api-keys", apiKeysRouter);

// Register Auth router
openapi.route("/auth", authRouter);

// Register Rules router
openapi.route("/rules", rulesRouter);

// Register Teams router
openapi.route("/teams", teamsRouter);

// Register Users router
openapi.route("/users", usersRouter);

// Export the Hono app
export default app;
