import { describe, expect, it, vi, beforeEach } from "vitest";
import { ORPCError } from "@orpc/server";
import * as usersProcedures from "~/server/orpc/procedures/users";
import { callProcedure, expectORPCError } from "~/tests/helpers/orpc";
import { createMockContext, createAuthenticatedContext } from "~/tests/helpers/mocks";
import type { PrismaClient } from "@prisma/client";

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

		// Setup mock context
		mockContext = createMockContext({
			db: mockPrisma,
		});
	});

	describe("getPublicProfile", () => {
		const validInput = {
			username: "testuser",
		};

		const mockUser = {
			id: "user_123",
			username: "testuser",
			displayName: "Test User Display",
			bio: "This is my bio",
			location: "Tokyo, Japan",
			website: "https://testuser.example.com",
			avatarUrl: "avatars/user_123/avatar.jpg",
			createdAt: 1640995200,
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

			// Call the procedure
			const result = await callProcedure(
				usersProcedures.getPublicProfile,
				validInput,
				mockContext,
			);

			// Assert the result
			expect(result).toEqual({
				user: {
					id: "user_123",
					username: "testuser",
					displayName: "Test User Display",
					bio: "This is my bio",
					location: "Tokyo, Japan",
					website: "https://testuser.example.com",
					avatarUrl: "avatars/user_123/avatar.jpg",
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
					displayName: true,
					bio: true,
					location: true,
					website: true,
					avatarUrl: true,
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

			// Call the procedure and expect error
			const error = await expectORPCError(
				usersProcedures.getPublicProfile,
				validInput,
				mockContext,
			);

			// Verify error details
			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError).code).toBe("NOT_FOUND");
			expect(error.message).toBe("User not found");

			// Verify database call
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { username: "testuser" },
				select: {
					id: true,
					username: true,
					displayName: true,
					bio: true,
					location: true,
					website: true,
					avatarUrl: true,
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

			// Call the procedure
			const result = await callProcedure(
				usersProcedures.getPublicProfile,
				validInput,
				mockContext,
			);

			// Assert description is converted to empty string
			expect(result.publicRules[0].description).toBe("");
		});

		it("should handle users with no public rules", async () => {
			// Mock user with no public rules
			mockPrisma.user.findUnique.mockResolvedValue(mockUser);
			mockPrisma.rule.count.mockResolvedValue(0);
			mockPrisma.ruleStar.count.mockResolvedValue(0);
			mockPrisma.rule.findMany.mockResolvedValue([]);

			// Call the procedure
			const result = await callProcedure(
				usersProcedures.getPublicProfile,
				validInput,
				mockContext,
			);

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

			// Call the procedure
			const result = await callProcedure(
				usersProcedures.getPublicProfile,
				validInput,
				mockContext,
			);

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
			// Setup context with authentication (but not the searched users)
			const authenticatedUser = createMockUser({ id: "user_3" });
			mockContext = createAuthenticatedContext(authenticatedUser, {
				db: mockPrisma,
			});

			// Mock database call
			mockPrisma.user.findMany.mockResolvedValue(mockUsers);

			// Call the procedure
			const result = await callProcedure(
				usersProcedures.searchByUsername,
				validInput,
				mockContext,
			);

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
			// Setup context with authentication
			const authenticatedUser = createMockUser({ id: "user_1" });
			mockContext = createAuthenticatedContext(authenticatedUser, {
				db: mockPrisma,
			});

			// Mock database call
			mockPrisma.user.findMany.mockResolvedValue(mockUsers);

			// Call the procedure
			const result = await callProcedure(
				usersProcedures.searchByUsername,
				validInput,
				mockContext,
			);

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

	describe("updateProfile", () => {
		let authenticatedContext: any;

		beforeEach(() => {
			const user = createMockUser();
			authenticatedContext = createAuthenticatedContext(user, {
				db: mockPrisma,
			});
		});

		const validInput = {
			displayName: "Test User",
			bio: "This is a test bio",
			location: "Tokyo, Japan",
			website: "https://example.com",
		};

		const mockUpdatedUser = {
			id: "user_123",
			email: "test@example.com",
			username: "testuser",
			emailVerified: true,
			displayName: "Test User",
			bio: "This is a test bio",
			location: "Tokyo, Japan",
			website: "https://example.com",
			avatarUrl: null,
			createdAt: 1640995200,
			updatedAt: 1641081600,
		};

		it("should update user profile successfully", async () => {
			// Mock database call
			mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

			// Call the procedure
			const result = await callProcedure(
				usersProcedures.updateProfile,
				validInput,
				authenticatedContext,
			);

			// Assert the result
			expect(result).toEqual({
				user: mockUpdatedUser,
			});

			// Verify database call
			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: "user_123" },
				data: {
					displayName: "Test User",
					bio: "This is a test bio",
					location: "Tokyo, Japan",
					website: "https://example.com",
					updatedAt: expect.any(Number),
				},
				select: {
					id: true,
					email: true,
					username: true,
					emailVerified: true,
					displayName: true,
					bio: true,
					location: true,
					website: true,
					avatarUrl: true,
					createdAt: true,
					updatedAt: true,
				},
			});
		});

		it("should handle partial updates", async () => {
			const partialInput = {
				displayName: "Updated Name",
			};

			const partiallyUpdatedUser = {
				...mockUpdatedUser,
				displayName: "Updated Name",
			};

			mockPrisma.user.update.mockResolvedValue(partiallyUpdatedUser);

			const result = await callProcedure(
				usersProcedures.updateProfile,
				partialInput,
				authenticatedContext,
			);

			expect(result.user.displayName).toBe("Updated Name");
			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: "user_123" },
				data: {
					displayName: "Updated Name",
					updatedAt: expect.any(Number),
				},
				select: expect.any(Object),
			});
		});

		it("should handle empty values to set fields to null", async () => {
			const emptyInput = {
				displayName: "",
				bio: "",
				location: "",
				website: "",
			};

			const nullUpdatedUser = {
				...mockUpdatedUser,
				displayName: null,
				bio: null,
				location: null,
				website: null,
			};

			mockPrisma.user.update.mockResolvedValue(nullUpdatedUser);

			const result = await callProcedure(
				usersProcedures.updateProfile,
				emptyInput,
				authenticatedContext,
			);

			expect(result.user.displayName).toBeNull();
			expect(result.user.bio).toBeNull();
			expect(result.user.location).toBeNull();
			expect(result.user.website).toBeNull();
		});

		it("should validate website URL", async () => {
			const invalidInput = {
				website: "invalid-url",
			};

			const error = await expectORPCError(
				usersProcedures.updateProfile,
				invalidInput,
				authenticatedContext,
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError).code).toBe("BAD_REQUEST");
			expect(error.message).toBe("Input validation failed");
		});

		it("should allow empty string for website", async () => {
			const emptyWebsiteInput = {
				website: "",
			};

			const updatedUser = {
				...mockUpdatedUser,
				website: null,
			};

			mockPrisma.user.update.mockResolvedValue(updatedUser);

			const result = await callProcedure(
				usersProcedures.updateProfile,
				emptyWebsiteInput,
				authenticatedContext,
			);

			expect(result.user.website).toBeNull();
			expect(mockPrisma.user.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						website: null,
					}),
				}),
			);
		});

		it("should require authentication", async () => {
			const error = await expectORPCError(
				usersProcedures.updateProfile,
				validInput,
				mockContext, // Unauthenticated context
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError).code).toBe("UNAUTHORIZED");
		});
	});

	describe("uploadAvatar", () => {
		let authenticatedContext: any;
		let mockR2: any;

		beforeEach(() => {
			const user = createMockUser();
			mockR2 = {
				put: vi.fn().mockResolvedValue({}),
			};
			authenticatedContext = createAuthenticatedContext(user, {
				db: mockPrisma,
				env: {
					R2: mockR2,
				},
			});
		});

		const validInput = {
			image: Buffer.from("fake-image-data").toString("base64"),
			filename: "avatar.jpg",
		};

		const mockUpdatedUser = {
			avatarUrl: "avatars/user_123/abc123.jpg",
		};

		it("should upload avatar successfully", async () => {
			// Mock nanoid
			vi.doMock("nanoid", () => ({
				nanoid: () => "abc123",
			}));

			mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

			const result = await callProcedure(
				usersProcedures.uploadAvatar,
				validInput,
				authenticatedContext,
			);

			expect(result).toEqual({
				avatarUrl: "avatars/user_123/abc123.jpg",
			});

			// Verify R2 upload
			expect(mockR2.put).toHaveBeenCalledWith(
				expect.stringMatching(/^avatars\/user_123\/.*\.jpg$/),
				expect.any(Buffer),
				{
					httpMetadata: {
						contentType: "image/jpeg",
					},
				},
			);

			// Verify database update
			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: "user_123" },
				data: {
					avatarUrl: expect.stringMatching(/^avatars\/user_123\/.*\.jpg$/),
					updatedAt: expect.any(Number),
				},
				select: {
					avatarUrl: true,
				},
			});
		});

		it("should validate image size", async () => {
			const largeImageInput = {
				image: Buffer.alloc(6 * 1024 * 1024).toString("base64"), // 6MB
				filename: "large-avatar.jpg",
			};

			const error = await expectORPCError(
				usersProcedures.uploadAvatar,
				largeImageInput,
				authenticatedContext,
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError).code).toBe("BAD_REQUEST");
			expect(error.message).toBe("Image size must be less than 5MB");
		});

		it("should validate image format", async () => {
			const invalidFormatInput = {
				image: validInput.image,
				filename: "avatar.txt",
			};

			const error = await expectORPCError(
				usersProcedures.uploadAvatar,
				invalidFormatInput,
				authenticatedContext,
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError).code).toBe("BAD_REQUEST");
			expect(error.message).toBe("Unsupported image format. Use JPG, PNG, GIF, or WebP");
		});

		it("should support different image formats", async () => {
			const formats = [
				{ filename: "avatar.png", contentType: "image/png" },
				{ filename: "avatar.gif", contentType: "image/gif" },
				{ filename: "avatar.webp", contentType: "image/webp" },
			];

			for (const format of formats) {
				vi.clearAllMocks();
				mockPrisma.user.update.mockResolvedValue({
					avatarUrl: `avatars/user_123/test.${format.filename.split('.')[1]}`,
				});

				const input = {
					image: validInput.image,
					filename: format.filename,
				};

				const result = await callProcedure(
					usersProcedures.uploadAvatar,
					input,
					authenticatedContext,
				);

				expect(result.avatarUrl).toContain(`avatars/user_123/`);
				expect(mockR2.put).toHaveBeenCalledWith(
					expect.any(String),
					expect.any(Buffer),
					{
						httpMetadata: {
							contentType: format.contentType,
						},
					},
				);
			}
		});

		it("should handle R2 storage not available", async () => {
			const contextWithoutR2 = createAuthenticatedContext(createMockUser(), {
				db: mockPrisma,
				env: {}, // No R2
			});

			const error = await expectORPCError(
				usersProcedures.uploadAvatar,
				validInput,
				contextWithoutR2,
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError).code).toBe("INTERNAL_SERVER_ERROR");
			expect(error.message).toBe("Storage not available");
		});

		it("should require authentication", async () => {
			const error = await expectORPCError(
				usersProcedures.uploadAvatar,
				validInput,
				mockContext, // Unauthenticated context
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError).code).toBe("UNAUTHORIZED");
		});

		it("should handle database errors gracefully", async () => {
			mockPrisma.user.update.mockRejectedValue(new Error("Database error"));

			const error = await expectORPCError(
				usersProcedures.uploadAvatar,
				validInput,
				authenticatedContext,
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError).code).toBe("INTERNAL_SERVER_ERROR");
			expect(error.message).toBe("Failed to upload avatar");
		});

		it("should handle R2 upload errors gracefully", async () => {
			mockR2.put.mockRejectedValue(new Error("R2 upload failed"));

			const error = await expectORPCError(
				usersProcedures.uploadAvatar,
				validInput,
				authenticatedContext,
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError).code).toBe("INTERNAL_SERVER_ERROR");
			expect(error.message).toBe("Failed to upload avatar");
		});
	});
});