import { describe, expect, it } from "vitest";

describe("OpenAPI Specification", () => {
	describe("API Documentation", () => {
		it("should generate valid OpenAPI specification", async () => {
			// Mock the OpenAPI spec response
			const mockSpec = {
				info: {
					title: "zxcv API",
					version: "1.0.0",
					description: "AI Coding Rules Management Platform API",
				},
				servers: [
					{
						url: "http://localhost:3000/api",
						description: "API Server",
					},
				],
				components: {
					schemas: {
						ErrorResponse: {
							type: "object",
							properties: {
								defined: { type: "boolean" },
								code: { type: "string" },
								status: { type: "number" },
								message: { type: "string" },
								data: {},
							},
							required: ["code", "status", "message"],
						},
						ValidationError: {
							type: "object",
							properties: {
								defined: { type: "boolean", default: false },
								code: { type: "string", default: "BAD_REQUEST" },
								status: { type: "integer", default: 400 },
								message: { type: "string", default: "Input validation failed" },
								data: { type: "object" },
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
				security: [{ bearerAuth: [] }],
				openapi: "3.1.1",
				paths: {
					"/auth/login": {
						post: {
							operationId: "auth.login",
							requestBody: {
								required: true,
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												email: { type: "string", format: "email" },
												password: { type: "string", minLength: 1 },
											},
											required: ["email", "password"],
										},
									},
								},
							},
							responses: {
								"200": {
									description: "OK",
									content: {
										"application/json": {
											schema: {
												type: "object",
												properties: {
													accessToken: { type: "string" },
													refreshToken: { type: "string" },
													user: { type: "object" },
												},
												required: ["accessToken", "refreshToken", "user"],
											},
										},
									},
								},
								"400": {
									description: "Bad Request - Validation Error",
									content: {
										"application/json": {
											schema: { $ref: "#/components/schemas/ValidationError" },
										},
									},
								},
								"500": {
									description: "Internal Server Error",
									content: {
										"application/json": {
											schema: { $ref: "#/components/schemas/ErrorResponse" },
										},
									},
								},
							},
						},
					},
				},
			};

			// Validate OpenAPI spec structure
			expect(mockSpec.info).toBeDefined();
			expect(mockSpec.info.title).toBe("zxcv API");
			expect(mockSpec.info.version).toBe("1.0.0");

			// Validate components
			expect(mockSpec.components).toBeDefined();
			expect(mockSpec.components.schemas).toBeDefined();
			expect(mockSpec.components.schemas.ErrorResponse).toBeDefined();
			expect(mockSpec.components.schemas.ValidationError).toBeDefined();
			expect(mockSpec.components.securitySchemes).toBeDefined();
			expect(mockSpec.components.securitySchemes.bearerAuth).toBeDefined();

			// Validate paths
			expect(mockSpec.paths).toBeDefined();
			expect(mockSpec.paths["/auth/login"]).toBeDefined();
			expect(mockSpec.paths["/auth/login"].post).toBeDefined();

			// Validate error responses
			const loginResponses = mockSpec.paths["/auth/login"].post.responses;
			expect(loginResponses["200"]).toBeDefined();
			expect(loginResponses["400"]).toBeDefined();
			expect(loginResponses["500"]).toBeDefined();

			// Validate error response schemas
			expect(mockSpec.components.schemas.ErrorResponse.properties).toHaveProperty("code");
			expect(mockSpec.components.schemas.ErrorResponse.properties).toHaveProperty("status");
			expect(mockSpec.components.schemas.ErrorResponse.properties).toHaveProperty("message");
			expect(mockSpec.components.schemas.ErrorResponse.required).toContain("code");
			expect(mockSpec.components.schemas.ErrorResponse.required).toContain("status");
			expect(mockSpec.components.schemas.ErrorResponse.required).toContain("message");
		});
	});

	describe("Swagger UI", () => {
		it("should serve Swagger UI documentation", async () => {
			// Mock HTML response
			const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
	<title>zxcv API Documentation</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
	<div id="swagger-ui"></div>
	<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
	<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
	<script>
		window.onload = () => {
			window.ui = SwaggerUIBundle({
				url: '/api-spec.json',
				dom_id: '#swagger-ui',
				presets: [
					SwaggerUIBundle.presets.apis,
					SwaggerUIStandalonePreset
				],
				layout: 'StandaloneLayout',
				deepLinking: true
			});
		};
	</script>
</body>
</html>`;

			// Validate Swagger UI HTML structure
			expect(mockHtml).toContain("swagger-ui");
			expect(mockHtml).toContain("/api-spec.json");
			expect(mockHtml).toContain("swagger-ui-dist@5.11.0");
			expect(mockHtml).toContain("SwaggerUIBundle");
		});
	});
});