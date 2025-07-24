import { describe, expect, it, beforeEach, vi } from "vitest";
import { createTestORPCClient } from "~/tests/helpers/orpc-client";
import { createMockPrismaClient, setupCommonMocks } from "~/tests/helpers/test-db";
import { generateId } from "~/server/utils/crypto";

// Mock email service
vi.mock("~/server/services/emailVerification", () => ({
	EmailVerificationService: class MockEmailVerificationService {
		constructor(db: any, env: any) {}
		sendVerificationEmail = vi.fn().mockResolvedValue(true);
		verifyEmail = vi.fn().mockImplementation(async (token: string) => {
			if (token === "valid_token") {
				return { success: true };
			}
			throw new Error("Invalid token");
		});
		resendVerificationEmail = vi.fn().mockResolvedValue(true);
	},
}));

// Mock OAuth providers
vi.mock("arctic", () => {
	class MockGoogle {
		constructor() {}
		createAuthorizationURL(state: string, codeVerifier: string, scopes: string[]) {
			const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
			url.searchParams.set("state", state);
			url.searchParams.set("code_challenge", codeVerifier);
			url.searchParams.set("scope", scopes.join(" "));
			return url;
		}
		validateAuthorizationCode = vi.fn().mockResolvedValue({
			accessToken: () => "mock-access-token",
		});
	}

	class MockGitHub {
		constructor() {}
		createAuthorizationURL(state: string, scopes: string[]) {
			const url = new URL("https://github.com/login/oauth/authorize");
			url.searchParams.set("state", state);
			url.searchParams.set("scope", scopes.join(" "));
			return url;
		}
		validateAuthorizationCode = vi.fn().mockResolvedValue({
			accessToken: () => "mock-github-token",
		});
	}

	return { Google: MockGoogle, GitHub: MockGitHub };
});

describe("E2E Authentication Flow Tests", () => {
	let client: ReturnType<typeof createTestORPCClient>["client"];
	let mockDb: ReturnType<typeof createMockPrismaClient>;
	const mockNow = Math.floor(Date.now() / 1000);

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockPrismaClient();
		setupCommonMocks(mockDb);
		
		const testSetup = createTestORPCClient({ db: mockDb });
		client = testSetup.client;
	});

	describe("Complete Registration and Login Flow", () => {
		it("should complete full registration, email verification, and login flow", async () => {
			const testUser = {
				username: "testuser",
				email: "test@example.com",
				password: "SecurePassword123!",
			};

			// Step 1: Register
			mockDb.user.findUnique.mockResolvedValue(null);
			mockDb.organization.findUnique.mockResolvedValue(null);
			const userId = generateId();
			
			mockDb.user.create.mockResolvedValue({
				id: userId,
				username: testUser.username.toLowerCase(),
				email: testUser.email.toLowerCase(),
				passwordHash: "hashed_password",
				emailVerified: false,
				createdAt: mockNow,
				updatedAt: mockNow,
			});

			const registerResult = await client.auth.register(testUser);
			
			expect(registerResult.success).toBe(true);
			expect(registerResult.message).toContain("登録が完了しました");
			expect(mockDb.user.create).toHaveBeenCalled();

			// Step 2: Verify Email
			const verificationToken = "valid_token";
			mockDb.emailVerification.findUnique.mockResolvedValue({
				id: "verification_id",
				userId,
				token: verificationToken,
				expiresAt: mockNow + 3600,
				createdAt: mockNow,
			});

			mockDb.user.update.mockResolvedValue({
				...mockDb.user.create.mock.results[0].value,
				emailVerified: true,
			});

			const verifyResult = await client.auth.verifyEmail({ token: verificationToken });
			expect(verifyResult.success).toBe(true);

			// Step 3: Login
			mockDb.user.findUnique.mockResolvedValue({
				id: userId,
				username: testUser.username.toLowerCase(),
				email: testUser.email.toLowerCase(),
				passwordHash: "hashed_password",
				emailVerified: true,
				createdAt: mockNow,
				updatedAt: mockNow,
			});

			// Password verification is already mocked globally in vitest.setup.mts

			const loginResult = await client.auth.login({
				email: testUser.email,
				password: testUser.password,
			});

			expect(loginResult.accessToken).toBeDefined();
			expect(loginResult.refreshToken).toBeDefined();
			expect(loginResult.user).toMatchObject({
				id: userId,
				email: testUser.email.toLowerCase(),
				username: testUser.username.toLowerCase(),
				emailVerified: true,
			});
		});
	});

	describe("Complete OAuth Flow", () => {
		it("should complete full OAuth registration and login flow with Google", async () => {
			// Step 1: Initialize OAuth
			const initResult = await client.auth.oauthInitialize({
				provider: "google",
				action: "login",
				redirectUrl: "/dashboard",
			});

			expect(initResult.authorizationUrl).toBeDefined();
			expect(initResult.authorizationUrl).toContain("accounts.google.com");

			// Extract state from URL
			const authUrl = new URL(initResult.authorizationUrl);
			const state = authUrl.searchParams.get("state");
			expect(state).toBeDefined();

			// Step 2: Simulate OAuth callback
			const stateData = JSON.parse(Buffer.from(state!, "base64url").toString());
			
			// Mock state lookup
			mockDb.oAuthState.findUnique.mockResolvedValue({
				id: "oauth_state_id",
				state: stateData.random,
				provider: "google",
				codeVerifier: "test_verifier",
				redirectUrl: "/dashboard",
				expiresAt: mockNow + 600,
				createdAt: mockNow,
			});

			// Mock Google user info response
			global.fetch = vi.fn().mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: "google_123",
					email: "oauth@example.com",
					name: "OAuth User",
				}),
			});

			// Mock no existing user
			mockDb.user.findUnique.mockResolvedValue(null);
			mockDb.oAuthAccount.findUnique.mockResolvedValue(null);

			// Mock user creation
			const newUserId = generateId();
			mockDb.user.create.mockResolvedValue({
				id: newUserId,
				email: "oauth@example.com",
				username: "oauth",
				passwordHash: null,
				emailVerified: true,
				createdAt: mockNow,
				updatedAt: mockNow,
			});

			const callbackResult = await client.auth.oauthCallback({
				provider: "google",
				code: "test_auth_code",
				state: state!,
			});

			expect(callbackResult.accessToken).toBeDefined();
			expect(callbackResult.refreshToken).toBeDefined();
			expect(callbackResult.user).toMatchObject({
				email: "oauth@example.com",
				emailVerified: true,
			});
			expect(callbackResult.redirectUrl).toBe("/dashboard");

			// Verify OAuth account was linked
			expect(mockDb.user.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					email: "oauth@example.com",
					emailVerified: true,
					passwordHash: null,
				}),
			});
		});

		it("should link OAuth to existing user account", async () => {
			const existingUserId = generateId();
			const existingUser = {
				id: existingUserId,
				email: "existing@example.com",
				username: "existinguser",
				passwordHash: "hashed",
				emailVerified: true,
				createdAt: mockNow - 86400,
				updatedAt: mockNow - 86400,
			};

			// Step 1: Initialize OAuth
			const initResult = await client.auth.oauthInitialize({
				provider: "github",
				action: "login",
			});

			const authUrl = new URL(initResult.authorizationUrl);
			const state = authUrl.searchParams.get("state");
			const stateData = JSON.parse(Buffer.from(state!, "base64url").toString());

			// Step 2: Setup callback mocks
			mockDb.oAuthState.findUnique.mockResolvedValue({
				id: "oauth_state_id",
				state: stateData.random,
				provider: "github",
				codeVerifier: null,
				redirectUrl: "/",
				expiresAt: mockNow + 600,
				createdAt: mockNow,
			});

			// Mock GitHub API responses
			global.fetch = vi.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						id: 123456,
						login: "githubuser",
						name: "GitHub User",
					}),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ([
						{
							email: "existing@example.com",
							primary: true,
							verified: true,
						},
					]),
				});

			// Mock existing user
			mockDb.user.findUnique.mockResolvedValue(existingUser);
			mockDb.oAuthAccount.findUnique.mockResolvedValue(null);

			// Mock OAuth account creation
			mockDb.oAuthAccount.create.mockResolvedValue({
				id: generateId(),
				userId: existingUserId,
				provider: "github",
				providerId: "123456",
				email: "existing@example.com",
				username: "githubuser",
			});

			const callbackResult = await client.auth.oauthCallback({
				provider: "github",
				code: "test_auth_code",
				state: state!,
			});

			expect(callbackResult.user.id).toBe(existingUserId);
			expect(callbackResult.user.email).toBe("existing@example.com");
			
			// Verify OAuth account was linked to existing user
			expect(mockDb.oAuthAccount.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					userId: existingUserId,
					provider: "github",
					providerId: "123456",
				}),
			});
		});
	});

	describe("Password Reset Flow", () => {
		it("should complete full password reset flow", async () => {
			const userId = generateId();
			const userEmail = "reset@example.com";

			// Step 1: Request password reset
			mockDb.user.findUnique.mockResolvedValue({
				id: userId,
				email: userEmail,
			});

			const resetToken = generateId();
			mockDb.passwordReset.create.mockResolvedValue({
				id: generateId(),
				userId,
				token: resetToken,
				expiresAt: mockNow + 3600,
				createdAt: mockNow,
			});

			const resetRequestResult = await client.auth.sendPasswordReset({
				email: userEmail,
			});

			expect(resetRequestResult.success).toBe(true);
			expect(mockDb.passwordReset.create).toHaveBeenCalled();

			// Step 2: Reset password with token
			// Mock the findFirst to return the token when searched
			mockDb.passwordReset.findFirst.mockImplementation(async (args) => {
				// Check if the token matches and other conditions
				if (args?.where?.token === resetToken && 
					args?.where?.usedAt === null &&
					args?.where?.expiresAt?.gt) {
					return {
						id: "reset_id",
						userId,
						token: resetToken,
						expiresAt: mockNow + 3600,
						createdAt: mockNow,
						usedAt: null,
					};
				}
				return null;
			});

			mockDb.user.update.mockResolvedValue({
				id: userId,
				email: userEmail,
				username: "resetuser",
				passwordHash: "new_hashed_password",
				emailVerified: true,
				createdAt: mockNow - 86400,
				updatedAt: mockNow,
			});

			mockDb.passwordReset.update.mockResolvedValue({
				id: "reset_id",
				userId,
				token: resetToken,
				expiresAt: mockNow + 3600,
				createdAt: mockNow,
				usedAt: mockNow,
			});

			const resetResult = await client.auth.resetPassword({
				token: resetToken,
				newPassword: "NewSecurePassword123!",
			});

			expect(resetResult.success).toBe(true);
			expect(mockDb.user.update).toHaveBeenCalledWith({
				where: { id: userId },
				data: expect.objectContaining({
					passwordHash: expect.any(String),
				}),
			});
			expect(mockDb.passwordReset.update).toHaveBeenCalledWith({
				where: { id: "reset_id" },
				data: { usedAt: expect.any(Number) },
			});
		});
	});

	describe("Rate Limiting", () => {
		it("should enforce rate limits on registration", async () => {
			// Mock rate limit reached
			mockDb.rateLimit.findUnique.mockResolvedValue({
				key: "auth:register:anonymous:default",
				count: 3, // Already at limit
				resetAt: mockNow + 3600,
			});

			await expect(
				client.auth.register({
					username: "ratelimited",
					email: "ratelimited@example.com",
					password: "Password123!",
				})
			).rejects.toThrow("リクエストが多すぎます");
		});

		it("should enforce rate limits on password reset", async () => {
			// Mock rate limit reached
			mockDb.rateLimit.findUnique.mockResolvedValue({
				key: "auth:reset:anonymous:default",
				count: 3, // Already at limit
				resetAt: mockNow + 900,
			});

			await expect(
				client.auth.sendPasswordReset({
					email: "reset@example.com",
				})
			).rejects.toThrow("リクエストが多すぎます");
		});
	});
});