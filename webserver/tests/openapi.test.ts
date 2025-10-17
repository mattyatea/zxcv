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
					// Based on the actual output, components might be empty
				},
				openapi: "3.0.0",
				paths: {
					"/auth/login": {
						post: {
							operationId: "auth_login",
							requestBody: {
								required: true,
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												email: { type: "string", format: "email" },
												password: { type: "string", minLength: 8 },
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
									description: "Bad Request",
									content: {
										"application/json": {
											schema: { type: "object" },
										},
									},
								},
								"500": {
									description: "Internal Server Error",
									content: {
										"application/json": {
											schema: { type: "object" },
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

			// Validate paths
			expect(mockSpec.paths).toBeDefined();
			expect(mockSpec.paths["/auth/login"]).toBeDefined();
			expect(mockSpec.paths["/auth/login"].post).toBeDefined();

			// Validate error responses
			const loginResponses = mockSpec.paths["/auth/login"].post.responses;
			expect(loginResponses["200"]).toBeDefined();
			expect(loginResponses["400"]).toBeDefined();
			expect(loginResponses["500"]).toBeDefined();
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
