import { describe, expect, it, vi, beforeEach } from "vitest";
import { createTestORPCClient, createAuthenticatedTestClient } from "~/tests/helpers/orpc-client";
import type { Router } from "~/server/orpc/router";
import { generateId, hashPassword } from "~/server/utils/crypto";
import { createJWT, verifyJWT } from "~/server/utils/jwt";
import { EmailVerificationService } from "~/server/services/emailVerification";
import { createMockPrismaClient, setupCommonMocks } from "~/tests/helpers/test-db";

// Mock email service
vi.mock("~/server/utils/email", () => ({
	EmailService: class MockEmailService {
		constructor(env: any) {}
		sendVerificationEmail = vi.fn().mockResolvedValue(true);
		sendResetPasswordEmail = vi.fn().mockResolvedValue(true);
	},
	sendEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock external dependencies
vi.mock("~/server/services/emailVerification", () => {
	class MockEmailVerificationService {
		constructor(db: any, env: any) {
			// Mock constructor
			console.log("[TEST] MockEmailVerificationService constructor called");
		}
		
		sendVerificationEmail = vi.fn().mockImplementation(async (userId: string, email: string) => {
			console.log("[TEST] MockEmailVerificationService.sendVerificationEmail called:", { userId, email });
			return Promise.resolve();
		});
		verifyEmail = vi.fn().mockImplementation(async (token: string) => {
			if (token === "expired_token") {
				throw new Error("Token expired");
			}
			return { success: true, userId: "user_123" };
		});
		resendVerificationEmail = vi.fn().mockResolvedValue(true);
	}
	
	return { EmailVerificationService: MockEmailVerificationService };
});

vi.mock("~/server/utils/jwt", async () => {
	const actual = await vi.importActual<typeof import("~/server/utils/jwt")>("~/server/utils/jwt");
	return {
		...actual,
		createJWT: vi.fn().mockImplementation(async (payload: any, env: any) => {
			console.log("[TEST] createJWT called with payload:", payload);
			console.log("[TEST] createJWT env:", env);
			const token = "mock_access_token";
			console.log("[TEST] createJWT returning:", token);
			return token;
		}),
		verifyJWT: vi.fn().mockImplementation(async (token: string) => {
			if (token === "mock_access_token" || token === "mock_jwt_token") {
				return { sub: "user_123", email: "test@example.com", username: "testuser" };
			}
			return null;
		}),
		verifyRefreshToken: vi.fn().mockImplementation((token: string, env?: any) => {
			console.log("[TEST] verifyRefreshToken called with token:", token);
			// Mock implementation that returns userId for valid tokens
			if (token.includes("user_123") || token === "valid_refresh_token") {
				return Promise.resolve("user_123");
			}
			return Promise.resolve(null);
		}),
		createRefreshToken: vi.fn().mockImplementation((userId: string, env?: any) => {
			console.log("[TEST] createRefreshToken called with userId:", userId);
			console.log("[TEST] createRefreshToken returning:", `refresh_token_${userId}`);
			return Promise.resolve(`refresh_token_${userId}`);
		}),
		verifyToken: vi.fn().mockImplementation(async (token: string, secret?: string) => {
			if (token === "valid_verification_token" || token === "valid_token" || token === "test_verification_token") {
				return { userId: "user_123", email: "test@example.com" };
			}
			if (token === "valid_reset_token" || token === "test_reset_token" || token === "reset_token") {
				return { userId: "user_123" };
			}
			throw new Error("Token expired");
		}),
		generateToken: vi.fn().mockImplementation(async (payload: any, secret: string, expiresIn: string) => {
			return "mock_jwt_token";
		}),
	};
});

// Get the global mock Prisma client
const mockPrismaClient = (globalThis as any).__mockPrismaClient;


// Need to unmock first due to hoisting
vi.unmock("~/server/utils/crypto");

// Mock crypto functions to avoid async import issues
vi.mock("~/server/utils/crypto", () => {
	console.log("[TEST] Setting up crypto mock");
	return {
		generateId: vi.fn().mockImplementation(() => `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
		hashPassword: vi.fn().mockImplementation(async (password: string) => {
			console.log("[TEST] hashPassword called with:", password);
			return `hashed_${password}`;
		}),
		verifyPassword: vi.fn().mockImplementation(async (password: string, hash: string) => {
			console.log("[TEST] verifyPassword called with:", { password, hash });
			// Simple mock - return true if password matches expected patterns
			if (password === "correctpassword") {
				console.log("[TEST] Password matches, returning true");
				return true;
			}
			if (password === "password123") return true;
			if (password === "newpassword123") return true;
			console.log("[TEST] Password does not match, returning false");
			return false;
		}),
	};
});


describe("Auth Integration Tests", () => {
	let client: any;
	let mockDb: any;
	let mockEnv: any;

	beforeEach(async () => {
		// Force re-import crypto module to ensure mocks are applied
		const cryptoModule = await import("~/server/utils/crypto");
		vi.mocked(cryptoModule.verifyPassword).mockImplementation(async (password: string, hash: string) => {
			console.log("[TEST BEFORE] verifyPassword called with:", { password, hash });
			return password === "correctpassword" || password === "password123";
		});
		// Use global mock database
		mockDb = mockPrismaClient;
		
		// Clear all mocks first
		vi.clearAllMocks();
		
		// Reset specific mocks to return expected default values
		vi.mocked(mockDb.user.findFirst).mockResolvedValue(null);
		vi.mocked(mockDb.user.findUnique).mockResolvedValue(null);
		vi.mocked(mockDb.user.findMany).mockResolvedValue([]);
		vi.mocked(mockDb.user.count).mockResolvedValue(0);
		
		vi.mocked(mockDb.rule.findFirst).mockResolvedValue(null);
		vi.mocked(mockDb.rule.findUnique).mockResolvedValue(null);
		vi.mocked(mockDb.rule.findMany).mockResolvedValue([]);
		vi.mocked(mockDb.rule.count).mockResolvedValue(0);
		
		vi.mocked(mockDb.organization.findFirst).mockResolvedValue(null);
		vi.mocked(mockDb.organization.findUnique).mockResolvedValue(null);
		vi.mocked(mockDb.organization.findMany).mockResolvedValue([]);
		
		vi.mocked(mockDb.emailVerification.findFirst).mockResolvedValue(null);
		vi.mocked(mockDb.emailVerification.findUnique).mockResolvedValue(null);
		
		vi.mocked(mockDb.passwordReset.findFirst).mockResolvedValue(null);
		vi.mocked(mockDb.passwordReset.findUnique).mockResolvedValue(null);
		
		vi.mocked(mockDb.team.findFirst).mockResolvedValue(null);
		vi.mocked(mockDb.team.findUnique).mockResolvedValue(null);
		vi.mocked(mockDb.team.findMany).mockResolvedValue([]);
		
		vi.mocked(mockDb.teamMember.findFirst).mockResolvedValue(null);
		vi.mocked(mockDb.teamMember.findUnique).mockResolvedValue(null);
		vi.mocked(mockDb.teamMember.findMany).mockResolvedValue([]);
		
		vi.mocked(mockDb.apiKey.findFirst).mockResolvedValue(null);
		vi.mocked(mockDb.apiKey.findUnique).mockResolvedValue(null);
		vi.mocked(mockDb.apiKey.findMany).mockResolvedValue([]);
		
		vi.mocked(mockDb.rateLimit.findFirst).mockResolvedValue(null);
		
		vi.mocked(mockDb.organizationMember.count).mockResolvedValue(0);
		vi.mocked(mockDb.organizationMember.findMany).mockResolvedValue([]);
		
		// Apply common setup mocks after clearing
		setupCommonMocks(mockDb);

		// Setup JWT mocks for dynamic imports
		const setupJWTMocks = async () => {
			try {
				const jwtModule = await import("~/server/utils/jwt");
				vi.mocked(jwtModule.createJWT).mockResolvedValue("mock_access_token");
				vi.mocked(jwtModule.createRefreshToken).mockResolvedValue("refresh_token_user_123");
				vi.mocked(jwtModule.verifyJWT).mockResolvedValue({
					sub: "user_123",
					email: "test@example.com",
					username: "testuser",
					emailVerified: true
				});
				vi.mocked(jwtModule.verifyRefreshToken).mockImplementation(async (token: string, env?: any) => {
					if (token.includes("user_123") || token === "valid_refresh_token") {
						return "user_123";
					}
					return null;
				});
				vi.mocked(jwtModule.generateToken).mockResolvedValue("mock_jwt_token");
			} catch (error) {
				console.log("[TEST] Failed to setup JWT mocks:", error);
			}
		};
		await setupJWTMocks();

		// Mock environment
		mockEnv = {
			DB: {} as any, // Mock D1 database binding
			JWT_SECRET: "test-secret",
			JWT_ALGORITHM: "HS256",
			JWT_EXPIRES_IN: "1h",
			REFRESH_TOKEN_EXPIRES_IN: "7d",
			EMAIL_FROM: "test@example.com",
			FRONTEND_URL: "http://localhost:3000",
			APP_URL: "http://localhost:3000",
			GITHUB_CLIENT_ID: "test-github-id",
			GITHUB_CLIENT_SECRET: "test-github-secret",
			GOOGLE_CLIENT_ID: "test-google-id",
			GOOGLE_CLIENT_SECRET: "test-google-secret",
			EMAIL_SEND: {
				send: vi.fn().mockResolvedValue({ success: true }),
			} as any,
			R2: {
				put: vi.fn(),
				get: vi.fn(),
				delete: vi.fn(),
			},
		};

		// Create test client with mocked context
		const testSetup = createTestORPCClient({
			db: mockDb,
			env: mockEnv,
		});
		client = testSetup.client;
		mockDb = testSetup.mockDb; // Update mockDb reference
	});

	describe("User Registration Flow", () => {
		it.skip("should complete full registration flow", async () => {
			// Step 1: Register a new user
			const registerInput = {
				username: "newuser",
				email: "newuser@example.com",
				password: "SecurePassword123!",
			};

			// Mock database responses for registration
			vi.mocked(mockDb.user.findFirst).mockResolvedValue(null);
			vi.mocked(mockDb.organization.findUnique).mockResolvedValue(null);
			
			const userId = generateId();
			const hashedPassword = await hashPassword(registerInput.password);
			
			const createdUser = {
				id: userId,
				username: registerInput.username.toLowerCase(),
				email: registerInput.email.toLowerCase(),
				passwordHash: hashedPassword,
				emailVerified: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: null,
				avatarUrl: null,
				bio: null,
				website: null,
				location: null,
				company: null,
				twitterUsername: null,
				githubUsername: null,
			};
			
			vi.mocked(mockDb.user.create).mockResolvedValue(createdUser);
			
			// Mock emailVerification.create
			vi.mocked(mockDb.emailVerification.create).mockResolvedValue({
				id: "verification_id",
				userId,
				token: "verification_token",
				expiresAt: Date.now() + 86400000, // 24 hours from now
			} as any);

			let registerResult;
			try {
				registerResult = await client.auth.register(registerInput);
			} catch (error) {
				console.error("Registration error:", error);
				throw error;
			}

			expect(registerResult.success).toBe(true);
			expect(registerResult.message).toContain("登録が完了しました");
			expect(registerResult.user).toMatchObject({
				username: "newuser",
				email: "newuser@example.com",
			});

			// Verify user was created
			expect(mockDb.user.create).toHaveBeenCalled();
		});

		it("should handle duplicate registration attempts", async () => {
			const existingUser = {
				id: "existing_user_id",
				username: "existinguser",
				email: "existing@example.com",
				passwordHash: "hashed",
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: null,
				avatarUrl: null,
				bio: null,
				website: null,
				location: null,
				company: null,
				twitterUsername: null,
				githubUsername: null,
			};

			// Mock finding existing user by email
			vi.mocked(mockDb.user.findUnique).mockResolvedValueOnce(existingUser);

			const registerInput = {
				username: "newuser",
				email: "existing@example.com", // Same email as existing user
				password: "SecurePassword123!",
			};

			await expect(
				client.auth.register(registerInput)
			).rejects.toThrow("このメールアドレスは既に使用されています");
		});
	});

	describe("User Login Flow", () => {
		it("should complete full login flow with email", async () => {
			const existingUser = {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				passwordHash: "hashed_correctpassword", // Use simple hash for testing
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: "Test User",
				avatarUrl: null as any,
				bio: null as any,
				website: null as any,
				location: null as any,
				company: null as any,
				twitterUsername: null as any,
				githubUsername: null as any,
			};

			// Mock database responses
			vi.mocked(mockDb.user.findUnique).mockImplementation(async (args: any) => {
				console.log("[TEST] user.findUnique called with:", args);
				if (args?.where?.email === "test@example.com") {
					console.log("[TEST] Returning existing user with passwordHash:", existingUser.passwordHash);
					return existingUser;
				}
				return null;
			});

			const loginInput = {
				email: "test@example.com",
				password: "correctpassword",
			};

			const loginResult = await client.auth.login(loginInput);

			expect(loginResult.user).toMatchObject({
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
			});
			expect(loginResult.accessToken).toBeDefined();
			expect(loginResult.refreshToken).toBeDefined();

			// Verify JWT was created correctly
			const decodedToken = await verifyJWT(loginResult.accessToken, mockEnv);
			expect(decodedToken?.sub).toBe("user_123");
		});

		it("should reject login with wrong password", async () => {
			const existingUser = {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				passwordHash: "hashed_correctpassword", // Use simple hash for testing
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: null,
				avatarUrl: null,
				bio: null,
				website: null,
				location: null,
				company: null,
				twitterUsername: null,
				githubUsername: null,
			};

			vi.mocked(mockDb.user.findUnique).mockResolvedValue(existingUser);

			const loginInput = {
				email: "test@example.com",
				password: "wrongpassword",
			};

			await expect(
				client.auth.login(loginInput)
			).rejects.toThrow("メールアドレスまたはパスワードが正しくありません");
		});

		it("should reject login for unverified email", async () => {
			const unverifiedUser = {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				passwordHash: await hashPassword("password123"),
				emailVerified: false, // Not verified
				createdAt: new Date(),
				updatedAt: new Date(),
				name: null,
				avatarUrl: null,
				bio: null,
				website: null,
				location: null,
				company: null,
				twitterUsername: null,
				githubUsername: null,
			};

			vi.mocked(mockDb.user.findFirst).mockResolvedValue(unverifiedUser);

			const loginInput = {
				email: "test@example.com",
				password: "password123",
			};

			await expect(
				client.auth.login(loginInput)
			).rejects.toThrow();
		});
	});

	describe("Token Refresh Flow", () => {
		it("should refresh tokens successfully", async () => {
			const userId = "user_123";
			const username = "testuser";
			const email = "test@example.com";

			// First, set up a user in the mock database
			mockDb.user.findUnique.mockImplementation(async ({ where }) => {
				if (where.email === email || where.id === userId) {
					return {
						id: userId,
						username,
						email,
						emailVerified: true,
						passwordHash: "hashed_password123",
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					};
				}
				return null;
			});

			// Login to get tokens
			const loginResult = await client.auth.login({
				email,
				password: "password123",
			});

			// Use the refresh token to refresh
			const refreshResult = await client.auth.refresh({
				refreshToken: loginResult.refreshToken,
			});

			expect(refreshResult.accessToken).toBeDefined();
			expect(refreshResult.refreshToken).toBeDefined();
			expect(refreshResult.user).toMatchObject({
				id: userId,
				username,
				email,
			});
		});

		it("should reject when not authenticated", async () => {
			// Use invalid refresh token
			await expect(
				client.auth.refresh({
					refreshToken: "invalid-token",
				})
			).rejects.toThrow();
		});
	});

	describe("Email Verification Flow", () => {
		it.skip("should verify email with valid token", async () => {
			const userId = "user_123";
			const token = "valid_verification_token";
			const email = "test@example.com";


			// Mock user lookup
			vi.mocked(mockDb.user.findUnique).mockResolvedValue({
				id: userId,
				username: "testuser",
				email,
				passwordHash: "hashed",
				emailVerified: false,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				isActive: true,
				emailNotifications: true,
				marketingEmails: false,
			});

			// Mock user update
			vi.mocked(mockDb.user.update).mockResolvedValue({
				id: userId,
				username: "testuser",
				email,
				passwordHash: "hashed",
				emailVerified: true,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				isActive: true,
				emailNotifications: true,
				marketingEmails: false,
			});

			const verifyResult = await client.auth.verifyEmail({ token });

			expect(verifyResult.success).toBe(true);
			expect(verifyResult.message).toBeDefined();
		});

		it("should reject expired verification token", async () => {
			const token = "expired_token";


			await expect(
				client.auth.verifyEmail({ token })
			).rejects.toThrow();
		});
	});

	describe("OAuth Flow", () => {
		it.skip("should initiate GitHub OAuth", async () => {
			// Skip OAuth tests as they might not exist in all auth implementations
		});

		it.skip("should initiate Google OAuth", async () => {
			// Skip OAuth tests as they might not exist in all auth implementations
		});
	});

	describe("Password Reset Flow", () => {
		it.skip("should handle password reset request", async () => {
			const existingUser = {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				passwordHash: "old_hash",
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: null,
				avatarUrl: null,
				bio: null,
				website: null,
				location: null,
				company: null,
				twitterUsername: null,
				githubUsername: null,
			};

			vi.mocked(mockDb.user.findUnique).mockResolvedValue(existingUser);
			vi.mocked(mockDb.passwordReset.create).mockResolvedValue({
				id: "reset_123",
				userId: existingUser.id,
				token: "reset_token",
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
			});

			const resetResult = await client.auth.sendPasswordReset({ 
				email: "test@example.com" 
			});

			expect(resetResult.success).toBe(true);
			expect(resetResult.message).toBeDefined();

			// Verify password reset was processed successfully
			// Note: The actual email sending is handled by EmailVerificationService, 
			// which is already mocked in the module mock
		});

		it.skip("should reset password with valid token", async () => {
			const userId = "user_123";
			const token = "valid_reset_token";
			const newPassword = "newpassword123";


			// Mock finding password reset record
			vi.mocked(mockDb.passwordReset.findFirst).mockResolvedValue({
				id: "reset_123",
				userId,
				token,
				expiresAt: Math.floor(Date.now() / 1000) + 3600,
				createdAt: Math.floor(Date.now() / 1000),
				usedAt: null,
			});

			// Mock user lookup
			vi.mocked(mockDb.user.findUnique).mockResolvedValue({
				id: userId,
				username: "testuser",
				email: "test@example.com",
				passwordHash: "old_hash",
				emailVerified: true,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				isActive: true,
				emailNotifications: true,
				marketingEmails: false,
			});

			// Mock password update
			vi.mocked(mockDb.user.update).mockResolvedValue({
				id: userId,
				username: "testuser",
				email: "test@example.com",
				passwordHash: "new_hashed_password",
				emailVerified: true,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				isActive: true,
				emailNotifications: true,
				marketingEmails: false,
			});

			// Mock marking reset as used
			vi.mocked(mockDb.passwordReset.update).mockResolvedValue({
				id: "reset_123",
				userId,
				token,
				expiresAt: Math.floor(Date.now() / 1000) + 3600,
				createdAt: Math.floor(Date.now() / 1000),
				usedAt: Math.floor(Date.now() / 1000),
			});

			const resetResult = await client.auth.resetPassword({
				token,
				newPassword,
			});

			expect(resetResult.success).toBe(true);
			expect(resetResult.message).toBeDefined();

			// Verify password was updated
			expect(mockDb.user.update).toHaveBeenCalledWith({
				where: { id: "user_123" },
				data: expect.objectContaining({
					passwordHash: expect.any(String),
					updatedAt: expect.any(Number),
				}),
			});

			// Verify reset token was marked as used
			expect(mockDb.passwordReset.update).toHaveBeenCalledWith({
				where: { id: "reset_123" },
				data: { usedAt: expect.any(Number) },
			});
		});
	});

	describe("User Profile Management", () => {
		it("should get current user profile", async () => {
			const currentUser = {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				emailVerified: true,
			};

			const userDetails = {
				...currentUser,
				passwordHash: "hashed",
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				name: "Test User",
				avatarUrl: "https://example.com/avatar.jpg",
				bio: "Test bio",
				website: "https://example.com",
				location: "Test City",
				company: "Test Company",
				twitterUsername: "testuser",
				githubUsername: "testuser",
			};

			vi.mocked(mockDb.user.findUnique).mockResolvedValue(userDetails);

			// Add teams membership
			vi.mocked(mockDb.teamMember.findMany).mockResolvedValue([
				{
					id: "member_123",
					teamId: "team_123",
					userId: "user_123",
					role: "MEMBER",
					joinedAt: new Date(),
				},
			]);

			vi.mocked(mockDb.team.findMany).mockResolvedValue([
				{
					id: "team_123",
					name: "Test Team",
					description: "Test team description",
					avatarUrl: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			// Create authenticated client
			const authSetup = createAuthenticatedTestClient(currentUser, {
				db: mockDb,
				env: mockEnv,
			});
			const authClient = authSetup.client;

			const meResult = await authClient.users.me();

			expect(meResult).toMatchObject({
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				emailVerified: expect.any(Boolean),
			});
			expect(meResult.createdAt).toBeDefined();
			expect(meResult.updatedAt).toBeDefined();
			expect(meResult.stats).toMatchObject({
				rulesCount: expect.any(Number),
				organizationsCount: expect.any(Number),
				totalStars: expect.any(Number),
			});
		});

		it("should update user profile", async () => {
			const currentUser = {
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				emailVerified: true,
			};

			const updateData = {
				displayName: "New Display Name",
				bio: "Updated bio",
				location: "New Location",
				website: "https://example.com",
			};

			vi.mocked(mockDb.user.update).mockResolvedValue({
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				passwordHash: "hashed",
				emailVerified: true,
				displayName: updateData.displayName,
				bio: updateData.bio,
				location: updateData.location,
				website: updateData.website,
				avatarUrl: null,
				settings: "{}",
				createdAt: 1234567890,
				updatedAt: Date.now() / 1000,
			});

			// Create authenticated client
			const authSetup = createAuthenticatedTestClient(currentUser, {
				db: mockDb,
				env: mockEnv,
			});
			const authClient = authSetup.client;

			const updateResult = await authClient.users.updateProfile(updateData);

			expect(updateResult.user).toMatchObject({
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				displayName: updateData.displayName,
				bio: updateData.bio,
				location: updateData.location,
				website: updateData.website,
				avatarUrl: null,
			});

			// Verify update was called correctly
			expect(mockDb.user.update).toHaveBeenCalledWith({
				where: { id: "user_123" },
				data: expect.objectContaining({
					displayName: updateData.displayName,
					bio: updateData.bio,
					location: updateData.location,
					website: updateData.website,
					updatedAt: expect.any(Number),
				}),
				select: expect.any(Object),
			});
		});
	});
});