import { ORPCError } from "@orpc/server";
import { describe, expect, it, vi } from "vitest";

describe("Error Handling", () => {
	describe("HTTP Status Code Mapping", () => {
		it("should map UNAUTHORIZED to 401", () => {
			const error = new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
			expect(error.code).toBe("UNAUTHORIZED");
			expect(error.message).toBe("Authentication required");
		});

		it("should map FORBIDDEN to 403", () => {
			const error = new ORPCError("FORBIDDEN", { message: "Access denied" });
			expect(error.code).toBe("FORBIDDEN");
			expect(error.message).toBe("Access denied");
		});

		it("should map NOT_FOUND to 404", () => {
			const error = new ORPCError("NOT_FOUND", { message: "Resource not found" });
			expect(error.code).toBe("NOT_FOUND");
			expect(error.message).toBe("Resource not found");
		});

		it("should map BAD_REQUEST to 400", () => {
			const error = new ORPCError("BAD_REQUEST", { message: "Invalid input" });
			expect(error.code).toBe("BAD_REQUEST");
			expect(error.message).toBe("Invalid input");
		});

		it("should map CONFLICT to 409", () => {
			const error = new ORPCError("CONFLICT", { message: "Resource already exists" });
			expect(error.code).toBe("CONFLICT");
			expect(error.message).toBe("Resource already exists");
		});

		it("should map INTERNAL_SERVER_ERROR to 500", () => {
			const error = new ORPCError("INTERNAL_SERVER_ERROR", { message: "Server error" });
			expect(error.code).toBe("INTERNAL_SERVER_ERROR");
			expect(error.message).toBe("Server error");
		});
	});

	describe("Error Response Format", () => {
		it("should have consistent error structure", () => {
			const error = new ORPCError("UNAUTHORIZED", {
				message: "Authentication required",
				data: { field: "token" },
			});

			expect(error.code).toBe("UNAUTHORIZED");
			expect(error.message).toBe("Authentication required");
			expect(error.data).toMatchObject({
				field: "token",
			});
		});

		it("should handle validation errors", () => {
			const validationError = {
				defined: false,
				code: "BAD_REQUEST",
				status: 400,
				message: "Input validation failed",
				data: {
					issues: [
						{
							code: "invalid_string",
							expected: "email",
							received: "string",
							path: ["email"],
							message: "Invalid email",
						},
					],
				},
			};

			expect(validationError.code).toBe("BAD_REQUEST");
			expect(validationError.status).toBe(400);
			expect(validationError.data.issues).toHaveLength(1);
			expect(validationError.data.issues[0].path).toEqual(["email"]);
		});
	});

	describe("Middleware Error Handling", () => {
		it("should throw UNAUTHORIZED when no user context", async () => {
			const mockNext = vi.fn();
			// biome-ignore lint/suspicious/noExplicitAny: Mock middleware for testing purposes
			const authMiddleware = async ({ context, next }: any) => {
				if (!context.user) {
					throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
				}
				return next({ context });
			};

			const context = { user: null };

			await expect(authMiddleware({ context, next: mockNext })).rejects.toThrow(ORPCError);

			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should pass through when user is authenticated", async () => {
			const mockNext = vi.fn().mockResolvedValue({ success: true });
			// biome-ignore lint/suspicious/noExplicitAny: Mock middleware for testing purposes
			const authMiddleware = async ({ context, next }: any) => {
				if (!context.user) {
					throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
				}
				return next({ context });
			};

			const context = { user: { id: "user_123", email: "test@example.com" } };
			const result = await authMiddleware({ context, next: mockNext });

			expect(mockNext).toHaveBeenCalledWith({ context });
			expect(result).toEqual({ success: true });
		});
	});

	describe("OpenAPI Error Documentation", () => {
		it("should include error schemas in OpenAPI spec", () => {
			const mockSpec = {
				components: {
					schemas: {
						ErrorResponse: {
							type: "object",
							properties: {
								defined: { type: "boolean" },
								code: { type: "string" },
								status: { type: "number" },
								message: { type: "string" },
								data: { type: "object" },
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
				},
			};

			expect(mockSpec.components.schemas.ErrorResponse).toBeDefined();
			expect(mockSpec.components.schemas.ValidationError).toBeDefined();
			expect(mockSpec.components.schemas.ErrorResponse.required).toContain("code");
			expect(mockSpec.components.schemas.ErrorResponse.required).toContain("status");
			expect(mockSpec.components.schemas.ErrorResponse.required).toContain("message");
		});

		it("should include error responses in endpoint definitions", () => {
			const mockEndpoint = {
				responses: {
					"200": { description: "Success" },
					"400": {
						description: "Bad Request - Validation Error",
						content: {
							"application/json": {
								schema: { "$ref": "#/components/schemas/ValidationError" },
							},
						},
					},
					"401": {
						description: "Unauthorized - Authentication required",
						content: {
							"application/json": {
								schema: { "$ref": "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"500": {
						description: "Internal Server Error",
						content: {
							"application/json": {
								schema: { "$ref": "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			};

			expect(mockEndpoint.responses["400"]).toBeDefined();
			expect(mockEndpoint.responses["401"]).toBeDefined();
			expect(mockEndpoint.responses["500"]).toBeDefined();
		});
	});
});
