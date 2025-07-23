import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import * as z from "zod";
import { router } from "~/server/orpc/router";

export default defineEventHandler(async () => {
	const generator = new OpenAPIGenerator({
		schemaConverters: [new ZodToJsonSchemaConverter()],
	});

	const spec = await generator.generate(router, {
		info: {
			title: "zxcv API",
			version: "1.0.0",
			description: "AI Coding Rules Management Platform API",
		},
		servers: [
			{
				url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/api`,
				description: "API Server",
			},
		],
		components: {
			schemas: {
				// Error response schema
				ErrorResponse: {
					type: "object",
					properties: {
						defined: {
							type: "boolean",
							description: "Indicates if this is a defined error",
						},
						code: {
							type: "string",
							description: "Error code",
							enum: [
								"BAD_REQUEST",
								"UNAUTHORIZED",
								"FORBIDDEN",
								"NOT_FOUND",
								"CONFLICT",
								"INTERNAL_SERVER_ERROR",
							],
						},
						status: {
							type: "integer",
							description: "HTTP status code",
						},
						message: {
							type: "string",
							description: "Error message",
						},
						data: {
							type: "object",
							description: "Additional error details",
						},
					},
					required: ["code", "status", "message"],
				},
				ValidationError: {
					type: "object",
					properties: {
						defined: {
							type: "boolean",
							default: false,
						},
						code: {
							type: "string",
							default: "BAD_REQUEST",
						},
						status: {
							type: "integer",
							default: 400,
						},
						message: {
							type: "string",
							default: "Input validation failed",
						},
						data: {
							type: "object",
							properties: {
								issues: {
									type: "array",
									items: {
										type: "object",
										properties: {
											code: { type: "string" },
											expected: { type: "string" },
											received: { type: "string" },
											path: {
												type: "array",
												items: { type: "string" },
											},
											message: { type: "string" },
										},
									},
								},
							},
						},
					},
					required: ["code", "status", "message"],
				},
			},
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "JWT authentication token obtained from /auth/login endpoint",
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		// Define common error schemas using oRPC's commonSchemas
		commonSchemas: {
			ErrorResponse: {
				schema: z.object({
					defined: z.boolean().optional(),
					code: z.string(),
					status: z.number(),
					message: z.string(),
					data: z.any().optional(),
				}),
			},
		},
	});

	// Add security requirements to protected endpoints
	if (spec.paths) {
		const protectedPaths = [
			"/users/profile",
			"/users/changePassword",
			"/users/deleteAccount",
			"/users/settings",
			"/users/updateProfile",
			"/users/updateSettings",
			"/users/searchByUsername",
			"/rules/create",
			"/rules/update",
			"/rules/delete",
			"/organizations",
			"/organizations/create",
			"/organizations/delete",
			"/organizations/inviteMember",
			"/organizations/leave",
			"/organizations/removeMember",
			"/organizations/updateMemberRole",
			"/organizations/acceptInvitation",
		];

		for (const [path, methods] of Object.entries(spec.paths)) {
			if (protectedPaths.some((p) => path.startsWith(p))) {
				for (const method of Object.values(methods as Record<string, unknown>)) {
					if (typeof method === "object" && method !== null && "operationId" in method) {
						const operation = method as Record<string, unknown>;
						operation.security = [{ bearerAuth: [] }];
					}
				}
			}
		}
	}

	// Add error responses to all endpoints
	if (spec.paths) {
		for (const [path, methods] of Object.entries(spec.paths)) {
			for (const [methodName, method] of Object.entries(methods as Record<string, unknown>)) {
				if (typeof method === "object" && method !== null && "operationId" in method) {
					const operation = method as Record<string, unknown>;
					// Add common error responses
					if (!operation.responses) {
						operation.responses = {};
					}

					// Add 400 Bad Request for endpoints with request body
					if (operation.requestBody) {
						(operation.responses as Record<string, unknown>)["400"] = {
							description: "Bad Request - Validation Error",
							content: {
								"application/json": {
									schema: {
										// biome-ignore lint/style/useNamingConvention: OpenAPI spec requires $ref syntax
										$ref: "#/components/schemas/ValidationError",
									},
								},
							},
						};
					}

					// Add 401 Unauthorized for protected endpoints
					if (
						operation.security &&
						Array.isArray(operation.security) &&
						operation.security.length > 0
					) {
						(operation.responses as Record<string, unknown>)["401"] = {
							description: "Unauthorized - Authentication required",
							content: {
								"application/json": {
									schema: {
										// biome-ignore lint/style/useNamingConvention: OpenAPI spec requires $ref syntax
										$ref: "#/components/schemas/ErrorResponse",
									},
								},
							},
						};
					}

					// Add 404 Not Found for paths with parameters
					if (path.includes("{")) {
						(operation.responses as Record<string, unknown>)["404"] = {
							description: "Not Found - Resource not found",
							content: {
								"application/json": {
									schema: {
										// biome-ignore lint/style/useNamingConvention: OpenAPI spec requires $ref syntax
										$ref: "#/components/schemas/ErrorResponse",
									},
								},
							},
						};
					}

					// Add 409 Conflict for create operations
					if (path.includes("create") || path.includes("register")) {
						(operation.responses as Record<string, unknown>)["409"] = {
							description: "Conflict - Resource already exists",
							content: {
								"application/json": {
									schema: {
										// biome-ignore lint/style/useNamingConvention: OpenAPI spec requires $ref syntax
										$ref: "#/components/schemas/ErrorResponse",
									},
								},
							},
						};
					}

					// Add 500 Internal Server Error for all endpoints
					(operation.responses as Record<string, unknown>)["500"] = {
						description: "Internal Server Error",
						content: {
							"application/json": {
								schema: {
									// biome-ignore lint/style/useNamingConvention: OpenAPI spec requires $ref syntax
									$ref: "#/components/schemas/ErrorResponse",
								},
							},
						},
					};
				}
			}
		}
	}

	return spec;
});
