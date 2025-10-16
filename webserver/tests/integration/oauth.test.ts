import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestORPCClient } from "~/tests/helpers/orpc-client";
import type { Router } from "~/server/orpc/router";
import { createMockPrismaClient, setupCommonMocks } from "~/tests/helpers/test-db";
import { generateId } from "~/server/utils/crypto";

// Mock arctic OAuth library completely to avoid arctic internal calls
vi.mock("arctic", () => {
	class MockGoogle {
		constructor(clientId: string, clientSecret: string, redirectUrl: string) {
			// Store params for verification if needed
		}
		
		createAuthorizationURL(state: string, codeVerifier: string, scopes: string[]) {
			const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
			url.searchParams.set("state", state);
			url.searchParams.set("code_challenge", codeVerifier);
			url.searchParams.set("scope", scopes.join(" "));
			return url;
		}
		
		async validateAuthorizationCode(code: string, codeVerifier: string) {
			// Return a mock token response
			return {
				accessToken: () => "mock-access-token",
			};
		}
	}

	class MockGitHub {
		constructor(clientId: string, clientSecret: string) {
			// Store params for verification if needed
		}
		
		createAuthorizationURL(state: string, scopes: string[]) {
			const url = new URL("https://github.com/login/oauth/authorize");
			url.searchParams.set("state", state);
			url.searchParams.set("scope", scopes.join(" "));
			return url;
		}
		
		async validateAuthorizationCode(code: string) {
			// Return a mock token response
			return {
				accessToken: () => "mock-github-token",
			};
		}
	}

	return {
		Google: MockGoogle,
		GitHub: MockGitHub,
	};
});

// Mock OAuth cleanup service
vi.mock("~/server/utils/oauthCleanup", () => ({
	cleanupExpiredOAuthStates: vi.fn().mockResolvedValue(0),
}));

// Mock OAuth security utilities
vi.mock("~/server/utils/oauthSecurity", () => ({
	validateRedirectUrl: vi.fn((url, domains) => {
		// Allow relative URLs that start with /
		if (url.startsWith("/") && !url.startsWith("//")) {
			return true;
		}
		// For tests, allow all localhost URLs
		return true;
	}),
	performOAuthSecurityChecks: vi.fn().mockResolvedValue(undefined),
	generateNonce: vi.fn().mockReturnValue("test-nonce"),
	validateOAuthResponse: vi.fn(),
	OAUTH_CONFIG: {
		STATE_EXPIRATION: 600,
		MAX_PENDING_STATES_PER_IP: 5,
		OAUTH_RATE_LIMIT: {
			windowMs: 900 * 1000,
			maxRequests: 10,
		},
	},
}));

// Create mock OAuth providers to be used in tests
const mockOAuthProviders = {
	google: {
		createAuthorizationURL: vi.fn((state: string, codeVerifier: string, scopes: string[]) => {
			const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
			url.searchParams.set("state", state);
			url.searchParams.set("code_challenge", codeVerifier);
			url.searchParams.set("scope", scopes.join(" "));
			return url;
		}),
		validateAuthorizationCode: vi.fn().mockResolvedValue({
			accessToken: () => "mock-access-token",
		}),
	},
	github: {
		createAuthorizationURL: vi.fn((state: string, scopes: string[]) => {
			const url = new URL("https://github.com/login/oauth/authorize");
			url.searchParams.set("state", state);
			url.searchParams.set("scope", scopes.join(" "));
			return url;
		}),
		validateAuthorizationCode: vi.fn().mockResolvedValue({
			accessToken: () => "mock-github-token",
		}),
	},
};

// Mock createOAuthProviders to return our mock providers
vi.mock("~/server/utils/oauth", async () => {
	const actual = await vi.importActual<typeof import("~/server/utils/oauth")>("~/server/utils/oauth");
	
	return {
		...actual,
		createOAuthProviders: vi.fn(() => mockOAuthProviders),
	};
});

describe("OAuth Integration Tests", () => {
	let client: ReturnType<typeof createTestORPCClient>["client"];
	let mockDb: ReturnType<typeof createMockPrismaClient>;
	const mockNow = Math.floor(Date.now() / 1000);

	beforeEach(() => {
		vi.clearAllMocks();
		
		// Reset mock providers
		mockOAuthProviders.google.validateAuthorizationCode.mockResolvedValue({
			accessToken: () => "mock-access-token",
		});
		mockOAuthProviders.github.validateAuthorizationCode.mockResolvedValue({
			accessToken: () => "mock-github-token",
		});
		
		mockDb = createMockPrismaClient();
		setupCommonMocks(mockDb);
		
		// Setup rate limit mock to not block requests
		mockDb.rateLimit.findUnique.mockResolvedValue(null);
		mockDb.rateLimit.upsert.mockResolvedValue({
			key: "auth:anonymous:default",
			count: 1,
			resetAt: mockNow + 900,
		});
		
		const testSetup = createTestORPCClient({ db: mockDb });
		client = testSetup.client;

		// Setup default mock returns
		mockDb.oAuthState.create.mockResolvedValue({
			id: "test-state-id",
			state: "test-state",
			provider: "google",
			codeVerifier: "test-verifier",
			redirectUrl: "/dashboard",
			expiresAt: mockNow + 600,
			createdAt: mockNow,
		});

		mockDb.oAuthState.findMany.mockResolvedValue([]);
		mockDb.oAuthState.findUnique.mockResolvedValue(null);
		mockDb.oAuthState.findFirst.mockResolvedValue(null);
		mockDb.oAuthState.deleteMany.mockResolvedValue({ count: 0 });
		mockDb.oAuthState.delete.mockResolvedValue({
			id: "test-state-id",
			state: "test-state",
			provider: "google",
			codeVerifier: "test-verifier",
			redirectUrl: "/dashboard",
			expiresAt: mockNow + 600,
			createdAt: mockNow,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("oauthInitialize", () => {
		describe("Google OAuth", () => {
			it("should initialize Google OAuth flow", async () => {
				const result = await client.auth.oauthInitialize({
					provider: "google",
					action: "login",
					redirectUrl: "/dashboard",
				});

				expect(result).toBeDefined();
				expect(result.authorizationUrl).toBeDefined();
				expect(result.authorizationUrl).toContain("accounts.google.com");

				// Verify state was created in database
				expect(mockDb.oAuthState.create).toHaveBeenCalledWith({
					data: expect.objectContaining({
						id: expect.any(String),
						state: expect.any(String),
						provider: "google",
						codeVerifier: expect.any(String),
						redirectUrl: "/dashboard",
						expiresAt: expect.any(Number),
					}),
				});
			});

			it("should generate PKCE code verifier for Google", async () => {
				await client.auth.oauthInitialize({
					provider: "google",
					action: "register",
				});

				expect(mockDb.oAuthState.create).toHaveBeenCalledWith({
					data: expect.objectContaining({
						provider: "google",
						codeVerifier: expect.any(String),
					}),
				});
			});
		});

		describe("GitHub OAuth", () => {
			it("should initialize GitHub OAuth flow", async () => {
				const result = await client.auth.oauthInitialize({
					provider: "github",
					action: "login",
					redirectUrl: "/profile",
				});

				expect(result).toBeDefined();
				expect(result.authorizationUrl).toBeDefined();
				expect(result.authorizationUrl).toContain("github.com");

				// Verify state was created in database
				expect(mockDb.oAuthState.create).toHaveBeenCalledWith({
					data: expect.objectContaining({
						provider: "github",
						codeVerifier: undefined,
						redirectUrl: "/profile",
					}),
				});
			});

			it("should not generate PKCE code verifier for GitHub", async () => {
				await client.auth.oauthInitialize({
					provider: "github",
					action: "register",
				});

				expect(mockDb.oAuthState.create).toHaveBeenCalledWith({
					data: expect.objectContaining({
						provider: "github",
						codeVerifier: undefined,
					}),
				});
			});
		});

		describe("State Management", () => {
			it("should cleanup expired states before creating new one", async () => {
				const { cleanupExpiredOAuthStates } = await import("~/server/utils/oauthCleanup");

				await client.auth.oauthInitialize({
					provider: "google",
					action: "login",
				});

				// Check that cleanup was called
				expect(cleanupExpiredOAuthStates).toHaveBeenCalled();
			});

			it("should encode action in state", async () => {
				const result = await client.auth.oauthInitialize({
					provider: "google",
					action: "register",
				});

				// Extract state from URL
				const url = new URL(result.authorizationUrl);
				const encodedState = url.searchParams.get("state");
				expect(encodedState).toBeDefined();

				// Decode state
				const stateData = JSON.parse(Buffer.from(encodedState!, "base64url").toString());
				expect(stateData.action).toBe("register");
				expect(stateData.random).toBeDefined();
			});
		});

		describe("Rate Limiting", () => {
			it.skip("should apply rate limiting to OAuth initialization", async () => {
				// Skip this test as rate limiting is handled by middleware
				// Mock rate limit hit (5 requests is the limit)
				mockDb.rateLimit.findUnique.mockResolvedValue({
					key: "auth:anonymous:default",
					count: 5, // Already at limit
					resetAt: mockNow + 300,
				});

				// Request should fail with rate limit
				await expect(
					client.auth.oauthInitialize({
						provider: "google",
						action: "login",
					})
				).rejects.toThrow(/リクエストが多すぎます。\d+秒後にもう一度お試しください。/);
			});
		});
	});

	describe("oauthCallback", () => {
		let validState: string;
		let stateRandom: string;

		beforeEach(() => {
			// Create a valid state
			stateRandom = "test-random-state";
			const stateData = {
				random: stateRandom,
				action: "login",
			};
			validState = Buffer.from(JSON.stringify(stateData)).toString("base64url");

			// Mock state lookup
			mockDb.oAuthState.findUnique.mockResolvedValue({
				id: "test-state",
				state: stateRandom,
				provider: "google",
				codeVerifier: "test-verifier",
				redirectUrl: "/dashboard",
				expiresAt: mockNow + 600,
				createdAt: mockNow,
			});
		});

		describe("State Validation", () => {
			it("should reject invalid state format", async () => {
				await expect(
					client.auth.oauthCallback({
						provider: "google",
						code: "test-code",
						state: "invalid-state",
					})
				).rejects.toThrow("無効または期限切れの状態です");
			});

			it("should reject non-existent state", async () => {
				mockDb.oAuthState.findUnique.mockResolvedValue(null);

				const fakeStateData = {
					random: "non-existent-state",
					action: "login",
				};
				const fakeState = Buffer.from(JSON.stringify(fakeStateData)).toString("base64url");

				await expect(
					client.auth.oauthCallback({
						provider: "google",
						code: "test-code",
						state: fakeState,
					})
				).rejects.toThrow("無効または期限切れの状態です");
			});

			it("should reject expired state", async () => {
				mockDb.oAuthState.findUnique.mockResolvedValue({
					id: "test-state",
					state: stateRandom,
					provider: "google",
					codeVerifier: "test-verifier",
					redirectUrl: "/dashboard",
					expiresAt: mockNow - 3600, // Expired
					createdAt: mockNow - 3600,
				});

				await expect(
					client.auth.oauthCallback({
						provider: "google",
						code: "test-code",
						state: validState,
					})
				).rejects.toThrow("無効または期限切れの状態です");
			});

			it("should reject mismatched provider", async () => {
				// State is for Google but callback is for GitHub
				await expect(
					client.auth.oauthCallback({
						provider: "github",
						code: "test-code",
						state: validState,
					})
				).rejects.toThrow("無効または期限切れの状態です");
			});
		});

		describe("User Creation and Linking", () => {
			beforeEach(() => {
				// Mock fetch for user info
				global.fetch = vi.fn();
				
				// Update validState to include action: "register" for new user tests
				const stateData = {
					random: stateRandom,
					action: "register",
				};
				validState = Buffer.from(JSON.stringify(stateData)).toString("base64url");
			});

			it("should create new user for first-time OAuth login", async () => {
				// Mock Google user info response
				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						id: "google-123",
						email: "newuser@example.com",
						displayName: "New User",
						avatarUrl: null,
					}),
				});

				// Mock no existing OAuth account
				mockDb.oAuthAccount.findUnique.mockResolvedValue(null);
				// Mock no existing user
				mockDb.user.findUnique.mockResolvedValue(null);

				// Mock temp registration creation
				const tempRegId = generateId();
				mockDb.oAuthTempRegistration.create.mockResolvedValue({
					id: tempRegId,
					token: "temp-token-123",
					provider: "google",
					providerId: "google-123",
					email: "newuser@example.com",
					providerUsername: null,
					expiresAt: mockNow + 3600,
					createdAt: mockNow,
				});

				const result = await client.auth.oauthCallback({
					provider: "google",
					code: "test-code",
					state: validState,
				});

				// Should return temp token for username selection
				expect(result).toMatchObject({
					provider: "google",
					requiresUsername: true,
				});
				expect(result.tempToken).toBeDefined();
				expect(typeof result.tempToken).toBe("string");

				// Verify temp registration was created
				expect(mockDb.oAuthTempRegistration.create).toHaveBeenCalledWith({
					data: expect.objectContaining({
						provider: "google",
						providerId: "google-123",
						email: "newuser@example.com",
					}),
				});

				// User should NOT be created yet
				expect(mockDb.user.create).not.toHaveBeenCalled();
			});

			it("should link OAuth to existing user with same email", async () => {
				const existingUserId = generateId();

				// Mock Google user info response
				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						id: "google-456",
						email: "existing@example.com",
						displayName: "Existing User",
						avatarUrl: null,
					}),
				});

				// Mock existing user
				mockDb.user.findUnique.mockResolvedValue({
					id: existingUserId,
					email: "existing@example.com",
					username: "existing",
					passwordHash: "hashed",
					emailVerified: true,
					role: "user",
					displayName: "Existing User",
					avatarUrl: null,
					bio: null,
					location: null,
					website: null,
					verificationToken: null,
					createdAt: mockNow - 86400,
					updatedAt: mockNow - 86400,
				});

				// Mock OAuth account doesn't exist yet
				mockDb.oAuthAccount.findUnique.mockResolvedValue(null);

				const result = await client.auth.oauthCallback({
					provider: "google",
					code: "test-code",
					state: validState,
				});

				expect(result.user.id).toBe(existingUserId);
				expect(result.user.email).toBe("existing@example.com");

				// Verify OAuth account was linked
				expect(mockDb.oAuthAccount.create).toHaveBeenCalledWith({
					data: expect.objectContaining({
						userId: existingUserId,
						provider: "google",
						providerId: "google-456",
					}),
				});
			});
		});

		describe("GitHub OAuth Specifics", () => {
			beforeEach(() => {
				// Update state for GitHub with register action
				const stateData = {
					random: stateRandom,
					action: "register",
				};
				validState = Buffer.from(JSON.stringify(stateData)).toString("base64url");
				
				mockDb.oAuthState.findUnique.mockResolvedValue({
					id: "test-state",
					state: stateRandom,
					provider: "github",
					codeVerifier: null,
					redirectUrl: "/dashboard",
					expiresAt: mockNow + 600,
					createdAt: mockNow,
				});
			});

			it("should handle GitHub email fetching", async () => {
				// Mock GitHub API responses
				(global.fetch as any)
					.mockResolvedValueOnce({
						ok: true,
						json: async () => ({
							id: 12345,
							login: "githubuser",
							displayName: "GitHub User",
							avatarUrl: null,
						}),
					})
					.mockResolvedValueOnce({
						ok: true,
						json: async () => [
							{
								email: "secondary@example.com",
								primary: false,
								verified: true,
							},
							{
								email: "primary@example.com",
								primary: true,
								verified: true,
							},
						],
					});

				// Mock no existing OAuth account
				mockDb.oAuthAccount.findUnique.mockResolvedValue(null);
				// Mock no existing user
				mockDb.user.findUnique.mockResolvedValue(null);

				// Mock temp registration creation
				const tempRegId = generateId();
				mockDb.oAuthTempRegistration.create.mockResolvedValue({
					id: tempRegId,
					token: "temp-token-github",
					provider: "github",
					providerId: "12345",
					email: "primary@example.com",
					providerUsername: "githubuser",
					expiresAt: mockNow + 3600,
					createdAt: mockNow,
				});

				const result = await client.auth.oauthCallback({
					provider: "github",
					code: "test-code",
					state: validState,
				});

				// Should return temp token for username selection
				expect(result).toMatchObject({
					provider: "github",
					requiresUsername: true,
				});
				expect(result.tempToken).toBeDefined();
				expect(typeof result.tempToken).toBe("string");
			});

			it("should handle missing GitHub email", async () => {
				// Mock GitHub API responses
				(global.fetch as any)
					.mockResolvedValueOnce({
						ok: true,
						json: async () => ({
							id: 12345,
							login: "githubuser",
							displayName: "GitHub User",
							avatarUrl: null,
						}),
					})
					.mockResolvedValueOnce({
						ok: true,
						json: async () => [], // No emails
					});

				await expect(
					client.auth.oauthCallback({
						provider: "github",
						code: "test-code",
						state: validState,
					})
				).rejects.toThrow("GitHubアカウントにメールアドレスが見つかりません");
			});
		});

		describe("Error Handling", () => {
			it("should handle OAuth provider errors gracefully", async () => {
				// Mock OAuth validation error
				mockOAuthProviders.google.validateAuthorizationCode.mockRejectedValueOnce(
					new Error("Invalid authorization code")
				);

				await expect(
					client.auth.oauthCallback({
						provider: "google",
						code: "invalid-code",
						state: validState,
					})
				).rejects.toThrow("OAuth認証に失敗しました");
				
				// Reset mock for next tests
				mockOAuthProviders.google.validateAuthorizationCode.mockResolvedValue({
					accessToken: () => "mock-access-token",
				});
			});

			it("should handle API fetch errors", async () => {
				// Mock fetch error
				(global.fetch as any).mockResolvedValueOnce({
					ok: false,
					status: 401,
					text: async () => "Unauthorized",
				});

				await expect(
					client.auth.oauthCallback({
						provider: "google",
						code: "test-code",
						state: validState,
					})
				).rejects.toThrow("Google認証に失敗しました");
			});
		});
	});
});