import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ORPCError, call } from "@orpc/server";
import { createMockContext, createAuthenticatedContext } from "~/tests/helpers/mocks";
import type { PrismaClient } from "@prisma/client";
import { getPublicProfile } from "~/server/orpc/procedures/users";
import { searchByUsername } from "~/server/orpc/procedures/users";

// Helper to create mock user
function createMockUser(overrides: Partial<any> = {}) {
	return {
		id: "user_123",
		username: "testuser",
		email: "test@example.com",
		emailVerified: true,
		createdAt: 1640995200,
		updatedAt: 1640995200,
		...overrides,
	};
}

describe("users procedures", () => {
	let mockPrisma: any;
	let mockContext: any;

	beforeEach(() => {
		vi.clearAllMocks();

		// Use the global mock Prisma client
		mockPrisma = (globalThis as any).__mockPrismaClient;

		// Setup mock context following oRPC testing patterns
		mockContext = createMockContext({
			db: mockPrisma, // Will be used by middleware when available
			env: {
				// Mock all required environment variables for middleware
				DB: mockPrisma, // This is what middleware will use if db is not in context
				JWT_SECRET: "test-jwt-secret",
				JWT_ALGORITHM: "HS256",
				JWT_EXPIRES_IN: "1h",
				REFRESH_TOKEN_EXPIRES_IN: "7d",
				EMAIL_FROM: "test@example.com",
				FRONTEND_URL: "http://localhost:3000",
				R2: {
					put: vi.fn(),
					get: vi.fn(),
					delete: vi.fn(),
				},
				EMAIL_SEND: {
					send: vi.fn().mockResolvedValue({ success: true }),
				},
			},
		});
	});

	describe("getPublicProfile", () => {
		const validInput = {
			username: "testuser",
		};

		const mockUser = {
			id: "user_123",
			username: "testuser",
			email: "test@example.com",
			emailVerified: true,
			createdAt: 1640995200,
			updatedAt: 1640995200,
		};

		const mockPublicRules = [
			{
				id: "rule_1",
				name: "test-rule-1",
				description: "Test description 1",
				visibility: "public",
				createdAt: 1640995200,
				updatedAt: 1640995200,
				userId: "user_123",
				organizationId: null,
				organization: null,
				starredBy: [{ id: "star_1" }, { id: "star_2" }],
			},
			{
				id: "rule_2",
				name: "test-rule-2",
				description: null,
				visibility: "public",
				createdAt: 1640995200,
				updatedAt: 1640995200,
				userId: "user_123",
				organizationId: "org_123",
				organization: { name: "testorg" },
				starredBy: [{ id: "star_3" }],
			},
		];

		it("should return public user profile successfully", async () => {
			// Mock database calls
			mockPrisma.user.findUnique.mockResolvedValue(mockUser);
			mockPrisma.rule.count.mockResolvedValue(5);
			mockPrisma.ruleStar.count.mockResolvedValue(10);
			mockPrisma.rule.findMany.mockResolvedValue(mockPublicRules);

			// Following oRPC docs: direct procedure invocation with call()
			// Documentation shows 2-argument form: call(procedure, input)
			const result = await call(getPublicProfile, validInput);

			// Assert the result
			expect(result).toEqual({
				user: {
					id: "user_123",
					username: "testuser",
					createdAt: 1640995200,
				},
				stats: {
					publicRulesCount: 5,
					totalStars: 10,
				},
				publicRules: [
					{
						id: "rule_1",
						name: "test-rule-1",
						description: "Test description 1",
						stars: 2,
						createdAt: 1640995200,
						updatedAt: 1640995200,
						organization: null,
					},
					{
						id: "rule_2",
						name: "test-rule-2",
						description: "",
						stars: 1,
						createdAt: 1640995200,
						updatedAt: 1640995200,
						organization: { name: "testorg" },
					},
				],
			});

			// Verify database calls
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { username: "testuser" },
				select: {
					id: true,
					username: true,
					createdAt: true,
				},
			});

			expect(mockPrisma.rule.count).toHaveBeenCalledWith({
				where: {
					userId: "user_123",
					visibility: "public",
				},
			});

			expect(mockPrisma.ruleStar.count).toHaveBeenCalledWith({
				where: {
					rule: {
						userId: "user_123",
						visibility: "public",
					},
				},
			});

			expect(mockPrisma.rule.findMany).toHaveBeenCalledWith({
				where: {
					userId: "user_123",
					visibility: "public",
				},
				select: {
					id: true,
					name: true,
					description: true,
					createdAt: true,
					updatedAt: true,
					organization: {
						select: {
							name: true,
						},
					},
					starredBy: {
						select: {
							id: true,
						},
					},
				},
				orderBy: {
					updatedAt: "desc",
				},
				take: 20,
			});
		});

		it("should throw NOT_FOUND error when user does not exist", async () => {
			// Mock user not found
			mockPrisma.user.findUnique.mockResolvedValue(null);

			// Call the procedure and expect error - using expect().rejects pattern from docs
			await expect(
				call(getPublicProfile, validInput)
			).rejects.toThrow(ORPCError);

			// Verify database call
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { username: "testuser" },
				select: {
					id: true,
					username: true,
					createdAt: true,
				},
			});

			// Ensure no other database calls were made
			expect(mockPrisma.rule.count).not.toHaveBeenCalled();
			expect(mockPrisma.ruleStar.count).not.toHaveBeenCalled();
			expect(mockPrisma.rule.findMany).not.toHaveBeenCalled();
		});

		it("should handle rules without description", async () => {
			// Mock user and rules
			mockPrisma.user.findUnique.mockResolvedValue(mockUser);
			mockPrisma.rule.count.mockResolvedValue(1);
			mockPrisma.ruleStar.count.mockResolvedValue(0);
			mockPrisma.rule.findMany.mockResolvedValue([
				{
					...mockPublicRules[1],
					description: null,
				},
			]);

			// Following oRPC docs: direct procedure invocation with call()
			const result = await call(getPublicProfile, validInput);

			// Assert description is converted to empty string
			expect(result.publicRules[0].description).toBe("");
		});

		it("should handle users with no public rules", async () => {
			// Mock user with no public rules
			mockPrisma.user.findUnique.mockResolvedValue(mockUser);
			mockPrisma.rule.count.mockResolvedValue(0);
			mockPrisma.ruleStar.count.mockResolvedValue(0);
			mockPrisma.rule.findMany.mockResolvedValue([]);

			// Following oRPC docs: direct procedure invocation with call()
			const result = await call(getPublicProfile, validInput);

			// Assert empty results
			expect(result.stats.publicRulesCount).toBe(0);
			expect(result.stats.totalStars).toBe(0);
			expect(result.publicRules).toEqual([]);
		});

		it("should handle rules without organization", async () => {
			// Mock user and rules without organization
			mockPrisma.user.findUnique.mockResolvedValue(mockUser);
			mockPrisma.rule.count.mockResolvedValue(1);
			mockPrisma.ruleStar.count.mockResolvedValue(0);
			mockPrisma.rule.findMany.mockResolvedValue([
				{
					...mockPublicRules[0],
					organization: null,
					organizationId: null,
				},
			]);

			// Following oRPC docs: direct procedure invocation with call()
			const result = await call(getPublicProfile, validInput);

			// Assert organization is null
			expect(result.publicRules[0].organization).toBeNull();
		});
	});

	describe("searchByUsername", () => {
		const validInput = {
			username: "test",
			limit: 5,
		};

		const mockUsers = [
			{
				id: "user_1",
				username: "testuser1",
				email: "test1@example.com",
			},
			{
				id: "user_2",
				username: "testuser2",
				email: "test2@example.com",
			},
		];

		it("should search users and mask emails for authenticated users (non-self)", async () => {
			// Setup global test user for authentication (but not the searched users)
			const authenticatedUser = createMockUser({ id: "user_3" });
			(globalThis as any).__testUser = authenticatedUser;

			// Mock database call
			mockPrisma.user.findMany.mockResolvedValue(mockUsers);

			// Call the procedure
			const result = await call(searchByUsername, validInput);

			// Assert emails are masked for non-self users
			expect(result).toEqual([
				{
					id: "user_1",
					username: "testuser1",
					email: null,
				},
				{
					id: "user_2",
					username: "testuser2",
					email: null,
				},
			]);

			// Verify database call
			expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
				where: {
					username: {
						contains: "test",
					},
				},
				select: {
					id: true,
					username: true,
					email: true,
				},
				take: 5,
				orderBy: {
					username: "asc",
				},
			});
		});

		it("should show user's own email when authenticated", async () => {
			// Setup global test user for authentication
			const authenticatedUser = createMockUser({ id: "user_1" });
			(globalThis as any).__testUser = authenticatedUser;

			// Mock database call
			mockPrisma.user.findMany.mockResolvedValue(mockUsers);

			// Call the procedure
			const result = await call(searchByUsername, validInput);

			// Assert only authenticated user's email is visible
			expect(result).toEqual([
				{
					id: "user_1",
					username: "testuser1",
					email: "test1@example.com", // Own email is visible
				},
				{
					id: "user_2",
					username: "testuser2",
					email: null, // Other emails are masked
				},
			]);
		});
	});

	afterEach(() => {
		// Clean up global test user
		delete (globalThis as any).__testUser;
	});
});