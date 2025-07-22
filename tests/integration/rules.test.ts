import { describe, expect, it, vi, beforeEach } from "vitest";
import { createTestORPCClient, createAuthenticatedTestClient } from "~/tests/helpers/orpc-client";
import { createMockPrismaClient, setupCommonMocks } from "~/tests/helpers/test-db";
import { generateId } from "~/server/utils/crypto";
import type { Router } from "~/server/orpc/router";

// Get the global mock Prisma client
const mockPrismaClient = (globalThis as any).__mockPrismaClient;

// Mock crypto functions
vi.mock("~/server/utils/crypto", async () => {
	const actual = await vi.importActual<typeof import("~/server/utils/crypto")>("~/server/utils/crypto");
	return {
		...actual,
		generateId: vi.fn().mockImplementation(() => `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
	};
});

describe("Rules Integration Tests", () => {
	let client: any;
	let mockDb: any;
	let mockR2: any;
	let mockEnv: any;

	const authenticatedUser = {
		id: "user_123",
		username: "testuser",
		email: "test@example.com",
		emailVerified: true,
	};

	beforeEach(() => {
		// Use global mock database
		mockDb = mockPrismaClient;
		
		// Don't use vi.clearAllMocks() as it clears the global mock implementations
		// Instead, reset only the mock calls
		Object.values(mockDb).forEach((model: any) => {
			if (model && typeof model === 'object') {
				Object.values(model).forEach((method: any) => {
					if (method && typeof method.mockClear === 'function') {
						method.mockClear();
					}
				});
			}
		});
		
		setupCommonMocks(mockDb);

		// Create mocked R2 bucket
		mockR2 = {
			put: vi.fn().mockResolvedValue({
				etag: "test-etag",
				version: "test-version",
			}),
			get: vi.fn().mockResolvedValue({
				body: {
					text: vi.fn().mockResolvedValue("# Test Rule Content"),
				},
			}),
			delete: vi.fn().mockResolvedValue(undefined),
			list: vi.fn().mockResolvedValue({
				objects: [],
				truncated: false,
			}),
		};

		// Mock environment
		mockEnv = {
			DB: {} as any,
			JWT_SECRET: "test-secret",
			JWT_ALGORITHM: "HS256",
			JWT_EXPIRES_IN: "1h",
			REFRESH_TOKEN_EXPIRES_IN: "7d",
			EMAIL_FROM: "test@example.com",
			FRONTEND_URL: "http://localhost:3000",
			APP_URL: "http://localhost:3000",
			R2: mockR2,
		};

		// Create authenticated test client
		const testSetup = createAuthenticatedTestClient(authenticatedUser, {
			db: mockDb,
			env: mockEnv,
		});
		client = testSetup.client;
		mockDb = testSetup.mockDb; // Update mockDb reference
	});

	describe("Rule Creation and Management", () => {
		it("should create a new rule", async () => {
			const createInput = {
				name: "my-awesome-rule",
				description: "An awesome coding rule",
				content: "# My Awesome Rule\n\nThis is the content of my rule.",
				visibility: "public" as const,
				tags: ["javascript", "best-practices"],
			};

			// Mock database checks
			vi.mocked(mockDb.rule.findFirst).mockResolvedValue(null);
			vi.mocked(mockDb.organization.findUnique).mockResolvedValue(null);

			// Mock rule creation
			const ruleId = generateId();
			vi.mocked(mockDb.rule.create).mockResolvedValue({
				id: ruleId,
				name: createInput.name,
				description: createInput.description,
				authorId: authenticatedUser.id,
				organizationId: null,
				visibility: createInput.visibility,
				latestVersion: 1,
				publishedAt: Math.floor(Date.now() / 1000),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				downloads: 0,
				views: 0,
			});

			// Mock rule version creation
			const versionId = generateId();
			vi.mocked(mockDb.ruleVersion.create).mockResolvedValue({
				id: versionId,
				ruleId,
				versionNumber: "1.0",
				contentHash: "hash",
				r2ObjectKey: `rules/${ruleId}/versions/${versionId}/content.md`,
				createdBy: authenticatedUser.id,
				changelog: null,
				createdAt: Math.floor(Date.now() / 1000),
			});

			// Mock rule update (to set latestVersionId)
			vi.mocked(mockDb.rule.update).mockResolvedValue({
				...vi.mocked(mockDb.rule.create).mock.results[0]?.value,
				latestVersionId: versionId,
			});

			// Mock tag operations
			vi.mocked(mockDb.tag.findMany).mockResolvedValue([]);

			const result = await client.rules.create(createInput);
			
			console.log("Create rule result:", result);

			expect(result).toBeDefined();
			expect(result.id).toBeDefined();
			expect(result.id).toBe(ruleId);

			// Verify R2 operations
			expect(mockR2.put).toHaveBeenCalledWith(
				expect.stringMatching(/^rules\/.*\/versions\/.*\/content\.md$/),
				createInput.content,
				expect.any(Object)
			);
		});

		it("should update an existing rule", async () => {
			const ruleId = "rule_123";
			const updateInput = {
				ruleId,
				description: "Updated description",
				content: "# Updated Content",
				releaseNotes: "Fixed typos",
			};

			// Mock existing rule
			const existingRule = {
				id: ruleId,
				name: "existing-rule",
				description: "Old description",
				authorId: authenticatedUser.id,
				organizationId: null,
				visibility: "public",
				latestVersion: 1,
				publishedAt: Math.floor(Date.now() / 1000),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				downloads: 10,
				views: 50,
			};

			vi.mocked(mockDb.rule.findUnique).mockResolvedValue(existingRule);
			vi.mocked(mockDb.rule.update).mockResolvedValue({
				...existingRule,
				description: updateInput.description,
				latestVersion: 2,
				updatedAt: Math.floor(Date.now() / 1000),
			});

			// Mock version creation
			vi.mocked(mockDb.ruleVersion.create).mockResolvedValue({
				id: generateId(),
				ruleId,
				version: 2,
				releaseNotes: updateInput.releaseNotes,
				downloads: 0,
				createdAt: Math.floor(Date.now() / 1000),
			});

			// Mock existing R2 content
			vi.mocked(mockR2.get).mockResolvedValue({
				body: {
					text: vi.fn().mockResolvedValue("# Old Content"),
				},
			});

			const result = await client.rules.update(updateInput);

			expect(result.success).toBe(true);
			expect(result.rule.description).toBe(updateInput.description);
			expect(result.rule.latestVersion).toBe(2);

			// Verify R2 operations
			expect(mockR2.put).toHaveBeenCalledWith(
				`rules/${ruleId}/versions/2/content.md`,
				updateInput.content,
				expect.any(Object)
			);
		});

		it("should delete a rule", async () => {
			const ruleId = "rule_123";

			// Mock existing rule
			const existingRule = {
				id: ruleId,
				name: "to-delete",
				description: "Rule to delete",
				authorId: authenticatedUser.id,
				organizationId: null,
				visibility: "public",
				latestVersion: 2,
				publishedAt: Math.floor(Date.now() / 1000),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				downloads: 5,
				views: 20,
			};

			vi.mocked(mockDb.rule.findUnique).mockResolvedValue(existingRule);
			vi.mocked(mockDb.rule.delete).mockResolvedValue(existingRule);

			// Mock version list for cleanup
			vi.mocked(mockDb.ruleVersion.findMany).mockResolvedValue([
				{ id: "v1", ruleId, version: 1, releaseNotes: null, downloads: 0, createdAt: 0 },
				{ id: "v2", ruleId, version: 2, releaseNotes: null, downloads: 0, createdAt: 0 },
			]);

			// Mock R2 list for cleanup
			vi.mocked(mockR2.list).mockResolvedValue({
				objects: [
					{ key: `rules/${ruleId}/versions/1/content.md` },
					{ key: `rules/${ruleId}/versions/2/content.md` },
				],
				truncated: false,
			});

			const result = await client.rules.delete({ ruleId });

			expect(result.success).toBe(true);
			expect(result.message).toContain("deleted successfully");

			// Verify R2 cleanup
			expect(mockR2.delete).toHaveBeenCalledWith(`rules/${ruleId}/versions/1/content.md`);
			expect(mockR2.delete).toHaveBeenCalledWith(`rules/${ruleId}/versions/2/content.md`);
		});
	});

	describe("Rule Discovery", () => {
		it("should list public rules with filtering", async () => {
			const mockRules = [
				{
					id: "rule_1",
					name: "javascript-best-practices",
					description: "Best practices for JavaScript",
					authorId: "user_456",
					organizationId: null,
					visibility: "public",
					latestVersion: 1,
					publishedAt: Math.floor(Date.now() / 1000),
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
					downloads: 100,
					views: 500,
					author: {
						id: "user_456",
						username: "otheruser",
						email: "other@example.com",
					},
					_count: {
						ruleLikes: 10,
					},
				},
			];

			vi.mocked(mockDb.rule.findMany).mockResolvedValue(mockRules);
			vi.mocked(mockDb.rule.count).mockResolvedValue(1);

			const result = await client.rules.list({
				visibility: "public",
				limit: 10,
			});

			expect(result.rules).toHaveLength(1);
			expect(result.total).toBe(1);
			expect(result.rules[0].name).toBe("javascript-best-practices");
		});

		it("should search rules by query", async () => {
			const searchQuery = "typescript";
			
			vi.mocked(mockDb.rule.findMany).mockResolvedValue([]);
			vi.mocked(mockDb.rule.count).mockResolvedValue(0);

			const result = await client.rules.search({
				query: searchQuery,
				limit: 10,
			});

			expect(result.rules).toHaveLength(0);
			expect(result.total).toBe(0);

			// Verify search was called with correct filters
			expect(mockDb.rule.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						OR: expect.arrayContaining([
							expect.objectContaining({
								name: expect.objectContaining({
									contains: searchQuery,
								}),
							}),
						]),
					}),
				})
			);
		});
	});

	describe("Rule Interactions", () => {
		it("should like a rule", async () => {
			const ruleId = "rule_123";

			// Mock rule exists
			vi.mocked(mockDb.rule.findUnique).mockResolvedValue({
				id: ruleId,
				name: "likeable-rule",
				authorId: "user_456",
			});

			// Mock no existing like
			vi.mocked(mockDb.ruleLike.findUnique).mockResolvedValue(null);

			// Mock like creation
			vi.mocked(mockDb.ruleLike.create).mockResolvedValue({
				id: generateId(),
				ruleId,
				userId: authenticatedUser.id,
				createdAt: Math.floor(Date.now() / 1000),
			});

			const result = await client.rules.like({ ruleId });

			expect(result.success).toBe(true);
			expect(result.liked).toBe(true);
		});

		it("should unlike a rule", async () => {
			const ruleId = "rule_123";

			// Mock rule exists
			vi.mocked(mockDb.rule.findUnique).mockResolvedValue({
				id: ruleId,
				name: "unlikeable-rule",
				authorId: "user_456",
			});

			// Mock existing like
			vi.mocked(mockDb.ruleLike.findUnique).mockResolvedValue({
				id: "like_123",
				ruleId,
				userId: authenticatedUser.id,
				createdAt: Math.floor(Date.now() / 1000),
			});

			// Mock like deletion
			vi.mocked(mockDb.ruleLike.delete).mockResolvedValue({
				id: "like_123",
				ruleId,
				userId: authenticatedUser.id,
				createdAt: Math.floor(Date.now() / 1000),
			});

			const result = await client.rules.unlike({ ruleId });

			expect(result.success).toBe(true);
			expect(result.liked).toBe(false);
		});

		it("should track rule views", async () => {
			const ruleId = "rule_123";

			// Mock rule exists
			vi.mocked(mockDb.rule.findUnique).mockResolvedValue({
				id: ruleId,
				name: "viewable-rule",
				authorId: "user_456",
				views: 10,
			});

			// Mock no recent view
			vi.mocked(mockDb.ruleView.findFirst).mockResolvedValue(null);

			// Mock view creation
			vi.mocked(mockDb.ruleView.create).mockResolvedValue({
				id: generateId(),
				ruleId,
				userId: authenticatedUser.id,
				viewedAt: Math.floor(Date.now() / 1000),
			});

			// Mock rule update
			vi.mocked(mockDb.rule.update).mockResolvedValue({
				id: ruleId,
				name: "viewable-rule",
				authorId: "user_456",
				views: 11,
			});

			const result = await client.rules.view({ ruleId });

			expect(result.success).toBe(true);
			expect(result.views).toBe(11);
		});
	});

	describe("Rule Versions", () => {
		it("should list rule versions", async () => {
			const ruleId = "rule_123";

			// Mock rule exists
			vi.mocked(mockDb.rule.findUnique).mockResolvedValue({
				id: ruleId,
				name: "versioned-rule",
				authorId: authenticatedUser.id,
			});

			// Mock versions
			const versions = [
				{
					id: "v2",
					ruleId,
					version: 2,
					releaseNotes: "Added new features",
					downloads: 50,
					createdAt: Math.floor(Date.now() / 1000),
				},
				{
					id: "v1",
					ruleId,
					version: 1,
					releaseNotes: null,
					downloads: 100,
					createdAt: Math.floor(Date.now() / 1000) - 86400,
				},
			];

			vi.mocked(mockDb.ruleVersion.findMany).mockResolvedValue(versions);

			const result = await client.rules.versions({ ruleId });

			expect(result.versions).toHaveLength(2);
			expect(result.versions[0].version).toBe(2);
			expect(result.versions[1].version).toBe(1);
		});

		it("should get specific version content", async () => {
			const ruleId = "rule_123";
			const version = 1;

			// Mock rule exists
			vi.mocked(mockDb.rule.findUnique).mockResolvedValue({
				id: ruleId,
				name: "versioned-rule",
				authorId: "user_456",
			});

			// Mock version exists
			vi.mocked(mockDb.ruleVersion.findFirst).mockResolvedValue({
				id: "v1",
				ruleId,
				version,
				releaseNotes: null,
				downloads: 100,
				createdAt: Math.floor(Date.now() / 1000),
			});

			// Mock R2 content
			const content = "# Version 1 Content";
			vi.mocked(mockR2.get).mockResolvedValue({
				body: {
					text: vi.fn().mockResolvedValue(content),
				},
			});

			const result = await client.rules.getVersion({ ruleId, version });

			expect(result.content).toBe(content);
			expect(result.version).toBe(version);
		});
	});
});