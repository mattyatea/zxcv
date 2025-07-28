import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";
import { router } from "~/server/orpc/router";
import { createMockPrismaClient } from "~/tests/helpers/test-db";

// Mock dependencies to avoid complex setup
vi.mock("~/server/utils/jwt", () => ({
	createJWT: vi.fn().mockResolvedValue("mock_jwt_token"),
	createRefreshToken: vi.fn().mockResolvedValue("mock_refresh_token"),
	generateToken: vi.fn().mockResolvedValue("reset_token"),
	verifyJWT: vi.fn().mockImplementation(async (token: string) => {
		if (token === "mock_jwt_token") {
			return {
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
			};
		}
		if (token === "mock_admin_token") {
			return {
				sub: "admin_123",
				email: "admin@example.com",
				username: "admin",
				emailVerified: true,
			};
		}
		return null;
	}),
	verifyToken: vi.fn().mockImplementation(async (token: string, secret?: string) => {
		if (token === "reset_token") {
			return { userId: "user_123" };
		}
		throw new Error("Invalid token");
	}),
	verifyRefreshToken: vi.fn().mockResolvedValue("user_123"),
}));

vi.mock("~/server/utils/crypto", () => ({
	generateId: vi.fn(() => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
	hashPassword: vi.fn().mockResolvedValue("hashed_password"),
	verifyPassword: vi.fn().mockResolvedValue(true), // Always return true for testing
}));

vi.mock("~/server/services/emailVerification", () => ({
	EmailVerificationService: class MockEmailVerificationService {
		constructor(db: any, env: any) {}
		sendVerificationEmail = vi.fn().mockResolvedValue(true);
		verifyEmail = vi.fn().mockResolvedValue({ success: true });
		resendVerificationEmail = vi.fn().mockResolvedValue(true);
	},
}));

vi.mock("~/server/services/AuthService", () => ({
	AuthService: class MockAuthService {
		constructor(db: any, env: any) {}
		resetPassword = vi.fn().mockResolvedValue({ message: "Password reset successfully" });
		verifyEmail = vi.fn().mockResolvedValue({ message: "Email verified successfully" });
		requestPasswordReset = vi.fn().mockResolvedValue(true);
		login = vi.fn().mockResolvedValue({
			accessToken: "mock_jwt_token",
			refreshToken: "mock_refresh_token",
			user: {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				emailVerified: true,
			},
		});
		register = vi.fn().mockResolvedValue({
			user: {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
			},
		});
		resendVerificationEmail = vi.fn().mockResolvedValue(true);
		handleOAuthLogin = vi.fn().mockResolvedValue({
			accessToken: "mock_jwt_token",
			refreshToken: "mock_refresh_token",
			user: {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				emailVerified: true,
			},
		});
		getUserById = vi.fn().mockResolvedValue({
			id: "user_123",
			username: "testuser",
			email: "test@example.com",
			emailVerified: true,
		});
	},
}));

vi.mock("~/server/utils/email", () => ({
	EmailService: class MockEmailService {
		constructor(env: any) {}
		generatePasswordResetEmail = vi.fn().mockReturnValue({
			to: "test@example.com",
			from: "noreply@example.com",
			subject: "Password Reset",
			text: "Reset your password",
			html: "<p>Reset your password</p>",
		});
		sendEmail = vi.fn().mockResolvedValue(true);
	},
	sendEmail: vi.fn().mockImplementation((env: any, emailData: any) => {
		console.log("[TEST] Email would be sent to:", emailData.to);
		console.log("[TEST] Subject:", emailData.subject);
		console.log("[DEV] Text content:", emailData.text);
		return Promise.resolve();
	}),
}));

describe("OpenAPI Endpoints via REST", () => {
	let mockDb: ReturnType<typeof createMockPrismaClient>;
	const mockNow = Math.floor(Date.now() / 1000);

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockPrismaClient();
	});

	// Create OpenAPI handler instance with interceptors matching server configuration
	const handler = new OpenAPIHandler(router, {
		plugins: [new CORSPlugin()],
		interceptors: [
			onError((error) => {
				console.log("oRPC onError interceptor:", {
					error,
					message: error.message,
				});
				// Re-throw the error to let OpenAPIHandler process it
				throw error;
			}),
		],
	});

	describe("Health Check Endpoint", () => {
		it("GET /api/health - should return healthy status", async () => {
			const request = new Request("http://localhost:3000/api/health", {
				method: "GET",
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			// Debug: log the response if not matched
			if (!response.matched) {
				console.log("Health endpoint not matched");
				console.log("Response status:", response.response.status);
				const body = await response.response.text();
				console.log("Response body:", body);
			}

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(200);

			const data = await response.response.json();
			expect(data).toEqual({
				status: "healthy",
				timestamp: expect.any(Number),
			});
		});
	});

	describe("Authentication Endpoints", () => {
		it("POST /api/auth/login - should validate input", async () => {
			const request = new Request("http://localhost:3000/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					// Missing required fields
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(400);

			const data = await response.response.json();
			expect(data).toMatchObject({
				code: "BAD_REQUEST",
				message: expect.stringContaining("validation"),
			});
		});

		it("GET /api/users/me - should require authentication", async () => {
			const request = new Request("http://localhost:3000/api/users/me", {
				method: "GET",
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined, // No authenticated user
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(401);

			const data = await response.response.json();
			expect(data).toMatchObject({
				code: "UNAUTHORIZED",
			});
		});

		it("GET /api/users/me - should return current user profile", async () => {
			// Mock the database response for profile endpoint
			mockDb.user.findUnique.mockResolvedValue({
				id: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				passwordHash: "hash",
				createdAt: mockNow,
				updatedAt: mockNow,
			});

			const request = new Request("http://localhost:3000/api/users/me", {
				method: "GET",
				headers: {
					Authorization: "Bearer mock_jwt_token",
				},
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: {
						id: "user_123",
						email: "test@example.com",
						username: "testuser",
						emailVerified: true,
					},
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			// Debug response
			if (!response.matched) {
				console.log("Response not matched for /api/users/me");
				const body = await response.response.text();
				console.log("Response body:", body);
			}
			
			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(200);

			const data = await response.response.json();
			expect(data).toMatchObject({
				id: "user_123",
				email: "test@example.com",
				username: "testuser",
				created_at: mockNow,
				updated_at: mockNow,
			});
		});
	});

	describe("Rules Endpoints", () => {
		it("POST /api/rules/search - should search for rules", async () => {
			const mockRules = [
				{
					id: "rule_1",
					name: "test-rule",
					description: "A test rule",
					visibility: "public",
					userId: "user_123",
					organizationId: null,
					tags: JSON.stringify(["test"]), // tags is stored as JSON string in DB
					createdAt: mockNow,
					updatedAt: mockNow,
					publishedAt: mockNow,
					version: "1.0.0",
					latestVersionId: null,
					downloads: 0,
					stars: 0,
					user: {
						id: "user_123",
						username: "testuser",
						email: "test@example.com",
					},
					organization: null,
				},
			];

			// Mock organization membership query
			mockDb.organizationMember.findMany.mockResolvedValue([]);

			// Mock rule queries
			mockDb.rule.findMany.mockResolvedValue(mockRules);
			mockDb.rule.count.mockResolvedValue(1);

			const request = new Request("http://localhost:3000/api/rules/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: "test",
					limit: 10,
					page: 1,
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(200);

			const data = await response.response.json();
			expect(data).toMatchObject({
				total: 1,
				rules: expect.arrayContaining([
					expect.objectContaining({
						id: "rule_1",
						name: "test-rule",
					}),
				]),
			});
		});

		it("POST /api/rules/create - should require authentication", async () => {
			const request = new Request("http://localhost:3000/api/rules/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: "new-rule",
					description: "A new rule",
					visibility: "public",
					tags: ["test"],
					content: "# Rule content",
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined, // No authenticated user
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(401);
		});

		it("POST /api/rules/delete - should require ownership", async () => {
			const mockRule = {
				id: "rule_123",
				name: "test-rule",
				userId: "user_456", // Different user (changed from ownerId to userId)
				visibility: "public",
				organizationId: null,
			};

			mockDb.rule.findUnique.mockResolvedValue(mockRule);
			// 組織メンバーシップのモック
			mockDb.teamMember.findFirst.mockResolvedValue(null);

			const request = new Request("http://localhost:3000/api/rules/delete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer mock_jwt_token",
				},
				body: JSON.stringify({
					id: "rule_123",
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: {
						id: "user_123", // Different from rule owner
						email: "test@example.com",
						username: "testuser",
						emailVerified: true,
					},
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(403);

			const data = await response.response.json();
			expect(data).toMatchObject({
				code: "FORBIDDEN",
			});
		});
	});

	describe("OpenAPI Spec", () => {
		it("should generate valid OpenAPI specification", async () => {
			// This is tested separately in openapi.test.ts
			// but we can verify the handler is configured correctly
			expect(handler).toBeDefined();
			expect(handler.handle).toBeInstanceOf(Function);
		});
	});

	describe("Error Handling", () => {
		it("should return 404 for unmatched routes", async () => {
			const request = new Request("http://localhost:3000/api/nonexistent", {
				method: "GET",
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
				},
			});

			expect(response.matched).toBe(false);
		});

		it("should handle malformed JSON", async () => {
			const request = new Request("http://localhost:3000/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: "{ invalid json",
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(400);
		});

		it("should validate content type", async () => {
			const request = new Request("http://localhost:3000/api/auth/login", {
				method: "POST",
				// Missing content-type header
				body: JSON.stringify({
					email: "test@example.com",
					password: "password123",
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
				},
			});

			// OpenAPI handler should still process the request
			expect(response.matched).toBe(true);
		});
	});

	describe("HTTP Methods", () => {
		it("should reject unsupported methods", async () => {
			const request = new Request("http://localhost:3000/api/health", {
				method: "POST", // Health check only supports GET
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
				},
			});

			// For oRPC, unmatched routes return false
			expect(response.matched).toBe(false);
		});

		it("should support OPTIONS for CORS preflight", async () => {
			const request = new Request("http://localhost:3000/api/auth/login", {
				method: "OPTIONS",
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(204);
			expect(response.response.headers.get("access-control-allow-methods")).toContain("POST");
		});
	});

	describe("Query Parameters", () => {
		it("should handle input parameters in POST requests", async () => {
			// Mock organization membership query
			mockDb.organizationMember.findMany.mockResolvedValue([]);
			
			// Mock rule queries
			mockDb.rule.findMany.mockResolvedValue([]);
			mockDb.rule.count.mockResolvedValue(0);

			const request = new Request("http://localhost:3000/api/rules/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					visibility: "public",
					limit: 5,
					page: 1,
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(200);

			const data = await response.response.json();
			expect(data).toMatchObject({
				total: 0,
				rules: [],
			});
		});
	});

	describe("Organizations Endpoints", () => {
		it("GET /api/organizations/list - should require authentication", async () => {
			const request = new Request("http://localhost:3000/api/organizations/list", {
				method: "GET",
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(401);
		});

		it("POST /api/organizations - should create organization for authenticated user", async () => {
			// Mock namespace availability check
			mockDb.user.findUnique.mockResolvedValue(null);
			mockDb.organization.findUnique.mockResolvedValue(null);
			
			// Mock organization name check
			mockDb.organization.findFirst.mockResolvedValue(null);
			
			const orgId = "org_123";
			
			// transaction をモック
			mockDb.$transaction.mockImplementation(async (callback) => {
				return callback(mockDb);
			});
			
			mockDb.organization.create.mockResolvedValue({
				id: orgId,
				name: "test-org",
				displayName: "Test Organization",
				description: null,
				ownerId: "user_123",
				createdAt: mockNow,
				updatedAt: mockNow,
				owner: {
					id: "user_123",
					username: "testuser",
					email: "test@example.com",
				},
			});

			mockDb.teamMember.create.mockResolvedValue({
				id: "member_123",
				organizationId: orgId,
				userId: "user_123",
				role: "owner",
				createdAt: mockNow,
			});

			const request = new Request("http://localhost:3000/api/organizations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer mock_jwt_token",
				},
				body: JSON.stringify({
					name: "test-org",
					displayName: "Test Organization",
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: {
						id: "user_123",
						email: "test@example.com",
						username: "testuser",
						emailVerified: true,
					},
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(200);

			const data = await response.response.json();
			expect(data).toMatchObject({
				id: orgId,
				name: "test-org",
				displayName: "Test Organization",
			});
		});

		it("DELETE /api/organizations/:id - should require ownership", async () => {
			const mockOrg = {
				id: "org_123",
				name: "test-org",
				ownerId: "other_user",
				createdAt: mockNow,
				updatedAt: mockNow,
			};

			mockDb.organization.findUnique.mockResolvedValue(mockOrg);
			// トランザクションのモック
			mockDb.$transaction.mockImplementation(async (callback) => {
				return callback(mockDb);
			});

			const request = new Request("http://localhost:3000/api/organizations/org_123", {
				method: "DELETE",
				headers: {
					Authorization: "Bearer mock_jwt_token",
				},
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: {
						id: "user_123",
						email: "test@example.com",
						username: "testuser",
						emailVerified: true,
					},
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(403);
		});
	});

	describe("Complete Authentication Flow via REST", () => {
		it.skip("should complete registration, email verification, and login flow", async () => {
			// Step 1: Register via REST API
			mockDb.user.findUnique.mockResolvedValue(null);
			mockDb.organization.findUnique.mockResolvedValue(null);
			
			const userId = "new_user_123";
			mockDb.user.create.mockResolvedValue({
				id: userId,
				username: "newuser",
				email: "newuser@example.com",
				passwordHash: "hashed_password",
				emailVerified: false,
				createdAt: mockNow,
				updatedAt: mockNow,
			});

			const registerRequest = new Request("http://localhost:3000/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: "newuser",
					email: "newuser@example.com",
					password: "SecurePassword123!",
				}),
			});

			// Mock rate limit
			mockDb.rateLimit.findUnique.mockResolvedValue(null);
			mockDb.rateLimit.create.mockResolvedValue({
				key: "auth:register:anonymous:default",
				count: 1,
				resetAt: mockNow + 3600,
			});

			const registerResponse = await handler.handle(registerRequest, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
						FRONTEND_URL: "http://localhost:3000",
						EMAIL_FROM: "noreply@example.com",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(registerResponse.matched).toBe(true);
			expect(registerResponse.response.status).toBe(200);

			const registerData = await registerResponse.response.json();
			expect(registerData.success).toBe(true);
			expect(registerData.user.email).toBe("newuser@example.com");

			// Step 2: Verify email via REST API
			mockDb.emailVerification.findUnique.mockResolvedValue({
				id: "verify_123",
				userId,
				token: "valid_token",
				expiresAt: mockNow + 3600,
				createdAt: mockNow,
			});

			mockDb.user.update.mockResolvedValue({
				id: userId,
				username: "newuser",
				email: "newuser@example.com",
				passwordHash: "hashed_password",
				emailVerified: true,
				createdAt: mockNow,
				updatedAt: mockNow,
			});

			const verifyRequest = new Request("http://localhost:3000/api/auth/verifyEmail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: "valid_token",
				}),
			});

			const verifyResponse = await handler.handle(verifyRequest, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(verifyResponse.matched).toBe(true);
			expect(verifyResponse.response.status).toBe(200);

			// Step 3: Login via REST API
			// Clear any previous mock implementations
			mockDb.user.findUnique.mockReset();
			mockDb.user.findUnique.mockImplementation(async (args) => {
				console.log("findUnique called with:", args);
				if (args?.where?.email === "newuser@example.com") {
					return {
						id: userId,
						username: "newuser",
						email: "newuser@example.com",
						passwordHash: "hashed_password",
						emailVerified: true,
						createdAt: mockNow,
						updatedAt: mockNow,
					};
				}
				return null;
			});

			// Mock rate limit for login
			mockDb.rateLimit.findUnique.mockResolvedValue(null);
			mockDb.rateLimit.create.mockResolvedValue({
				key: "auth:anonymous:default",
				count: 1,
				resetAt: mockNow + 900,
			});

			const loginRequest = new Request("http://localhost:3000/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "newuser@example.com",
					password: "SecurePassword123!", // 登録時と同じパスワード
				}),
			});

			const loginResponse = await handler.handle(loginRequest, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
						JWT_ALGORITHM: "HS256",
						JWT_EXPIRES_IN: "1h",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(loginResponse.matched).toBe(true);
			expect(loginResponse.response.status).toBe(200);

			const loginData = await loginResponse.response.json();
			expect(loginData.accessToken).toBeDefined();
			expect(loginData.refreshToken).toBeDefined();
			expect(loginData.user.email).toBe("newuser@example.com");
			expect(loginData.user.emailVerified).toBe(true);
		});

		it("should handle OAuth initialization and callback via REST", async () => {
			// Step 1: Initialize OAuth
			const initRequest = new Request("http://localhost:3000/api/auth/oauthInitialize", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					provider: "google",
					action: "login",
					redirectUrl: "/dashboard",
				}),
			});

			// Mock rate limit
			mockDb.rateLimit.findUnique.mockResolvedValue(null);
			mockDb.rateLimit.create.mockResolvedValue({
				key: "auth:anonymous:default",
				count: 1,
				resetAt: mockNow + 900,
			});

			// Mock OAuth state creation
			mockDb.oAuthState.create.mockResolvedValue({
				id: "state_123",
				state: "random_state",
				provider: "google",
				codeVerifier: "test_verifier",
				redirectUrl: "/dashboard",
				expiresAt: mockNow + 600,
				createdAt: mockNow,
			});

			// Mock cleanup
			mockDb.oAuthState.deleteMany.mockResolvedValue({ count: 0 });

			const initResponse = await handler.handle(initRequest, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
						GOOGLE_CLIENT_ID: "test_client_id",
						GOOGLE_CLIENT_SECRET: "test_client_secret",
						APP_URL: "http://localhost:3000",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(initResponse.matched).toBe(true);
			expect(initResponse.response.status).toBe(200);

			const initData = await initResponse.response.json();
			expect(initData.authorizationUrl).toContain("accounts.google.com");
		});
	});

	describe("Password Reset Flow via REST", () => {
		it("should handle password reset request and completion", async () => {
			// Step 1: Request password reset
			const userId = "user_123";
			mockDb.user.findUnique.mockResolvedValue({
				id: userId,
				email: "reset@example.com",
				username: "resetuser",
				emailVerified: true,
				passwordHash: "old_password",
				createdAt: mockNow - 86400,
				updatedAt: mockNow - 86400,
			});

			mockDb.passwordReset.create.mockResolvedValue({
				id: "reset_123",
				userId,
				token: "reset_token",
				expiresAt: mockNow + 3600,
				createdAt: mockNow,
			});

			// Mock rate limit
			mockDb.rateLimit.findUnique.mockResolvedValue(null);
			mockDb.rateLimit.create.mockResolvedValue({
				key: "auth:reset:anonymous:default",
				count: 1,
				resetAt: mockNow + 900,
			});

			const resetRequest = new Request("http://localhost:3000/api/auth/sendPasswordReset", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "reset@example.com",
				}),
			});

			const resetResponse = await handler.handle(resetRequest, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
						FRONTEND_URL: "http://localhost:3000",
						EMAIL_FROM: "noreply@example.com",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(resetResponse.matched).toBe(true);
			expect(resetResponse.response.status).toBe(200);

			// Step 2: Reset password with token
			mockDb.passwordReset.findFirst.mockImplementation(async (args) => {
				// Check if the token matches and other conditions
				if (args?.where?.token === "reset_token" && 
					args?.where?.usedAt === null &&
					args?.where?.expiresAt?.gt) {
					return {
						id: "reset_123",
						userId,
						token: "reset_token",
						expiresAt: mockNow + 3600,
						createdAt: mockNow,
						usedAt: null,
					};
				}
				return null;
			});

			mockDb.user.update.mockResolvedValue({
				id: userId,
				email: "reset@example.com",
				username: "resetuser",
				passwordHash: "new_hashed_password",
				emailVerified: true,
				createdAt: mockNow - 86400,
				updatedAt: mockNow,
			});

			mockDb.passwordReset.update.mockResolvedValue({
				id: "reset_123",
				userId,
				token: "reset_token",
				expiresAt: mockNow + 3600,
				createdAt: mockNow,
				usedAt: mockNow,
			});

			const completeResetRequest = new Request("http://localhost:3000/api/auth/resetPassword", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: "reset_token",
					newPassword: "NewSecurePassword123!",
				}),
			});

			const completeResetResponse = await handler.handle(completeResetRequest, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(completeResetResponse.matched).toBe(true);
			
			
			expect(completeResetResponse.response.status).toBe(200);

			const completeData = await completeResetResponse.response.json();
			expect(completeData.success).toBe(true);
		});
	});

	describe("Rate Limiting via REST API", () => {
		it("should enforce rate limits on authentication endpoints", async () => {
			// Mock rate limit exceeded
			mockDb.rateLimit.findUnique.mockResolvedValue({
				key: "auth:anonymous:default",
				count: 5, // At limit
				resetAt: mockNow + 900,
			});

			const request = new Request("http://localhost:3000/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "test@example.com",
					password: "password123",
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(429);

			const data = await response.response.json();
			expect(data.code).toBe("TOO_MANY_REQUESTS");
		});
	});

	describe("Users Endpoints via REST", () => {
		it("POST /api/users/getProfile - should return user profile", async () => {
			const mockUser = {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				emailVerified: true,
				createdAt: mockNow,
				updatedAt: mockNow,
			};

			mockDb.user.findUnique.mockResolvedValue(mockUser);
			mockDb.rule.count.mockResolvedValue(5);
			mockDb.organizationMember.count.mockResolvedValue(1);
			mockDb.rule.findMany.mockResolvedValue([]);

			const request = new Request("http://localhost:3000/api/users/getProfile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: "testuser",
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: undefined,
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(200);

			const data = await response.response.json();
			expect(data).toMatchObject({
				user: expect.objectContaining({
					id: "user_123",
					username: "testuser",
				}),
				stats: {
					rulesCount: 5,
					organizationsCount: 1,
				},
			});
		});

		it("POST /api/users/updateProfile - should update user profile for owner", async () => {
			const mockUser = {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				emailVerified: true,
				createdAt: mockNow,
				updatedAt: mockNow,
			};

			mockDb.user.findUnique.mockResolvedValue(mockUser);
			// メールの重複チェック用のモック
			mockDb.user.findFirst.mockResolvedValue(null);
			mockDb.user.update.mockResolvedValue({
				...mockUser,
				email: "newemail@example.com",
				updatedAt: mockNow,
			});

			const request = new Request("http://localhost:3000/api/users/updateProfile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer mock_jwt_token",
				},
				body: JSON.stringify({
					email: "newemail@example.com",
				}),
			});

			const response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user: {
						id: "user_123",
						email: "test@example.com",
						username: "testuser",
						emailVerified: true,
					},
					env: {
						JWT_SECRET: "test-secret",
					} as any,
					cloudflare: {} as any,
					db: mockDb,
				},
			});

			expect(response.matched).toBe(true);
			expect(response.response.status).toBe(200);

			const data = await response.response.json();
			expect(data.user.email).toBe("newemail@example.com");
		});
	});
});