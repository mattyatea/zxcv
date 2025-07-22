import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock crypto functions BEFORE imports
vi.mock("~/server/utils/crypto", async () => {
	const actual = await vi.importActual<typeof import("~/server/utils/crypto")>("~/server/utils/crypto");
	return {
		...actual,
		generateId: vi.fn().mockImplementation(() => `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
		hashContent: vi.fn().mockImplementation(async (content: string) => {
			return `hash_${content.substring(0, 10)}`;
		}),
	};
});

import { createTestORPCClient, createAuthenticatedTestClient } from "~/tests/helpers/orpc-client";
import { createMockPrismaClient, setupCommonMocks } from "~/tests/helpers/test-db";
import { generateId } from "~/server/utils/crypto";
import type { Router } from "~/server/orpc/router";

// Get the global mock Prisma client
const mockPrismaClient = (globalThis as any).__mockPrismaClient;

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

	beforeEach(async () => {
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
				text: vi.fn().mockResolvedValue("# Test Rule Content"),
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

		// Setup crypto mocks for dynamic imports used by procedures
		const cryptoModule = await import("~/server/utils/crypto");
		vi.mocked(cryptoModule.generateId).mockImplementation(() => `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
		vi.mocked(cryptoModule.hashContent).mockImplementation(async (content: string) => {
			return `hash_${content.substring(0, 10)}`;
		});

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
			const ruleId = `test_rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
			vi.mocked(mockDb.rule.create).mockResolvedValue({
				id: ruleId,
				name: createInput.name,
				description: createInput.description,
				userId: authenticatedUser.id,
				organizationId: null,
				visibility: createInput.visibility,
				version: "1.0.0",
				latestVersionId: null,
				publishedAt: Math.floor(Date.now() / 1000),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				downloads: 0,
				stars: 0,
				tags: JSON.stringify(createInput.tags),
			});

			// Mock rule version creation
			const versionId = `test_version_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

			expect(result).toBeDefined();
			expect(result.id).toBeDefined();
			expect(result.id).toBe(ruleId);

			// Verify R2 operations
			expect(mockR2.put).toHaveBeenCalledWith(
				expect.stringMatching(/^rules\/.*\/versions\/.*\/content\.md$/),
				createInput.content
			);
		});

		it("should update an existing rule", async () => {
			const ruleId = "rule_123";
			const updateInput = {
				id: ruleId, // Use 'id' instead of 'ruleId' for the update input
				description: "Updated description",
				content: "# Updated Content",
				changelog: "Fixed typos",
			};

			// Mock existing rule
			const existingRule = {
				id: ruleId,
				name: "existing-rule",
				description: "Old description",
				userId: authenticatedUser.id,
				organizationId: null,
				visibility: "public",
				version: "1.0.0",
				latestVersionId: null,
				publishedAt: Math.floor(Date.now() / 1000),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				downloads: 10,
				stars: 0,
				tags: "[]",
			};

			vi.mocked(mockDb.rule.findUnique).mockResolvedValue(existingRule);

			// Mock current version (needed by update procedure)
			vi.mocked(mockDb.ruleVersion.findFirst).mockResolvedValue({
				id: "version_1",
				ruleId,
				versionNumber: "1.0.0",
				changelog: null,
				contentHash: "old-hash",
				r2ObjectKey: `rules/${ruleId}/versions/version_1/content.md`,
				createdBy: authenticatedUser.id,
				createdAt: Math.floor(Date.now() / 1000),
			});

			// Mock existing versions query (needed for version calculation)
			// The procedure only selects versionNumber field
			vi.mocked(mockDb.ruleVersion.findMany).mockResolvedValue([
				{
					versionNumber: "1.0.0",
				},
			]);
			vi.mocked(mockDb.rule.update).mockResolvedValue({
				...existingRule,
				description: updateInput.description,
				version: "2.0.0",
				updatedAt: Math.floor(Date.now() / 1000),
			});

			// Mock version creation
			const newVersionId = generateId();
			vi.mocked(mockDb.ruleVersion.create).mockResolvedValue({
				id: newVersionId,
				ruleId,
				versionNumber: "2.0.0",
				changelog: updateInput.changelog,
				contentHash: "new-hash",
				r2ObjectKey: `rules/${ruleId}/versions/${newVersionId}/content.md`,
				createdBy: authenticatedUser.id,
				createdAt: Math.floor(Date.now() / 1000),
			});

			// Mock existing R2 content - R2Object has text() method directly, not body.text()
			const mockR2Response = {
				text: async () => "# Old Content",
			};
			mockR2.get.mockResolvedValue(mockR2Response);
			
			const result = await client.rules.update(updateInput);

			expect(result.success).toBe(true);

			// Verify R2 operations
			expect(mockR2.put).toHaveBeenCalledWith(
				expect.stringMatching(/^rules\/.*\/versions\/.*\/content\.md$/),
				updateInput.content
			);
		});

		it("should delete a rule", async () => {
			const ruleId = "rule_123";

			// Mock existing rule
			const existingRule = {
				id: ruleId,
				name: "to-delete",
				description: "Rule to delete",
				userId: authenticatedUser.id,
				organizationId: null,
				visibility: "public",
				version: "2.0.0",
				latestVersionId: null,
				publishedAt: Math.floor(Date.now() / 1000),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				downloads: 5,
				stars: 0,
				tags: "[]",
			};

			vi.mocked(mockDb.rule.findUnique).mockResolvedValue(existingRule);
			vi.mocked(mockDb.rule.delete).mockResolvedValue(existingRule);

			// Mock version list for cleanup
			vi.mocked(mockDb.ruleVersion.findMany).mockResolvedValue([
				{
					id: "v1",
					ruleId,
					versionNumber: "1.0",
					r2ObjectKey: `rules/${ruleId}/versions/v1/content.md`,
					changelog: null,
					contentHash: "hash1",
					createdAt: 0,
					createdBy: authenticatedUser.id,
				},
				{
					id: "v2",
					ruleId,
					versionNumber: "2.0",
					r2ObjectKey: `rules/${ruleId}/versions/v2/content.md`,
					changelog: null,
					contentHash: "hash2",
					createdAt: 0,
					createdBy: authenticatedUser.id,
				},
			]);

			// Mock R2 delete operations
			vi.mocked(mockR2.delete).mockResolvedValue(undefined);

			const result = await client.rules.delete({ id: ruleId });

			expect(result.success).toBe(true);
			
			// Verify R2 cleanup was performed
			expect(mockR2.delete).toHaveBeenCalledTimes(2);
			expect(mockR2.delete).toHaveBeenCalledWith(`rules/${ruleId}/versions/v1/content.md`);
			expect(mockR2.delete).toHaveBeenCalledWith(`rules/${ruleId}/versions/v2/content.md`);
		});
	});

	describe("Rule Discovery", () => {
		it("should list public rules with filtering", async () => {
			const mockRules = [
				{
					id: "rule_1",
					name: "javascript-best-practices",
					description: "Best practices for JavaScript",
					userId: "user_456",
					organizationId: null,
					visibility: "public",
					version: "1.0",
					latestVersionId: null,
					publishedAt: Math.floor(Date.now() / 1000),
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
					downloads: 100,
					stars: 10,
					tags: null,
					user: {
						id: "user_456",
						username: "otheruser",
						email: "other@example.com",
					},
					organization: null,
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
			
			// Mock organization member query (needed by search procedure)
			vi.mocked(mockDb.organizationMember.findMany).mockResolvedValue([]);
			
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
						AND: expect.arrayContaining([
							expect.objectContaining({
								OR: expect.arrayContaining([
									expect.objectContaining({
										name: expect.objectContaining({
											contains: searchQuery,
										}),
									}),
									expect.objectContaining({
										description: expect.objectContaining({
											contains: searchQuery,
										}),
									}),
								]),
							}),
						]),
					}),
					include: expect.any(Object),
					orderBy: expect.any(Object),
					skip: expect.any(Number),
					take: expect.any(Number),
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
				userId: "user_456",
				visibility: "public",
				description: null,
				tags: null,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				version: "1.0.0",
				latestVersionId: null,
				downloads: 0,
				stars: 0,
				organizationId: null,
			});

			// Mock no existing star
			vi.mocked(mockDb.ruleStar.findFirst).mockResolvedValue(null);

			// Mock star creation
			vi.mocked(mockDb.ruleStar.create).mockResolvedValue({
				id: generateId(),
				ruleId,
				userId: authenticatedUser.id,
				createdAt: Math.floor(Date.now() / 1000),
			});

			const result = await client.rules.like({ ruleId });

			expect(result.success).toBe(true);
			expect(result.message).toContain("liked successfully");
		});

		it("should unlike a rule", async () => {
			const ruleId = "rule_123";

			// Mock rule exists
			vi.mocked(mockDb.rule.findUnique).mockResolvedValue({
				id: ruleId,
				name: "unlikeable-rule",
				userId: "user_456",
				visibility: "public",
				description: null,
				tags: null,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				version: "1.0.0",
				latestVersionId: null,
				downloads: 0,
				stars: 0,
				organizationId: null,
			});

			// Mock existing star (API uses ruleStar not ruleLike)
			vi.mocked(mockDb.ruleStar.findFirst).mockResolvedValue({
				id: "star_123",
				ruleId,
				userId: authenticatedUser.id,
				createdAt: Math.floor(Date.now() / 1000),
			});

			// Mock star deletion
			vi.mocked(mockDb.ruleStar.deleteMany).mockResolvedValue({ count: 1 });

			const result = await client.rules.unlike({ ruleId });

			expect(result.success).toBe(true);
			expect(result.message).toContain("unliked successfully");
		});

		it("should track rule views", async () => {
			const ruleId = "rule_123";

			// Mock rule exists
			vi.mocked(mockDb.rule.findUnique).mockResolvedValue({
				id: ruleId,
				name: "viewable-rule",
				userId: "user_456",
				visibility: "public",
				description: null,
				tags: null,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				version: "1.0.0",
				latestVersionId: null,
				downloads: 10,
				stars: 0,
				organizationId: null,
			});

			// Mock download creation (API tracks downloads, not views)
			vi.mocked(mockDb.ruleDownload.create).mockResolvedValue({
				id: generateId(),
				ruleId,
				userId: authenticatedUser.id,
				ipAddress: "127.0.0.1",
				userAgent: "test-client",
				downloadedAt: Math.floor(Date.now() / 1000),
			});

			const result = await client.rules.view({ ruleId });

			expect(result.success).toBe(true);
			expect(result.message).toBe("View tracked");
		});
	});

	describe("Rule Versions", () => {
		it("should list rule versions", async () => {
			const ruleId = "rule_123";

			// Mock rule exists
			vi.mocked(mockDb.rule.findUnique).mockResolvedValue({
				id: ruleId,
				name: "versioned-rule",
				userId: authenticatedUser.id,
				organizationId: null,
				visibility: "public",
				version: "2.0",
				description: null,
				tags: null,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				latestVersionId: null,
				downloads: 0,
				stars: 0,
			});

			// Mock versions
			const versions = [
				{
					id: "v2",
					ruleId,
					versionNumber: "2.0",
					changelog: "Added new features",
					contentHash: "hash2",
					r2ObjectKey: `rules/${ruleId}/versions/v2/content.md`,
					createdBy: authenticatedUser.id,
					createdAt: Math.floor(Date.now() / 1000),
					creator: {
						id: authenticatedUser.id,
						username: authenticatedUser.username,
					},
				},
				{
					id: "v1",
					ruleId,
					versionNumber: "1.0",
					changelog: null,
					contentHash: "hash1",
					r2ObjectKey: `rules/${ruleId}/versions/v1/content.md`,
					createdBy: authenticatedUser.id,
					createdAt: Math.floor(Date.now() / 1000) - 86400,
					creator: {
						id: authenticatedUser.id,
						username: authenticatedUser.username,
					},
				},
			];

			vi.mocked(mockDb.ruleVersion.findMany).mockResolvedValue(versions);

			const result = await client.rules.versions({ id: ruleId });

			expect(result).toHaveLength(2);
			expect(result[0].version).toBe("2.0");
			expect(result[1].version).toBe("1.0");
		});

		it("should get specific version content", async () => {
			const ruleId = "rule_123";
			const version = 1;

			// Mock rule exists
			vi.mocked(mockDb.rule.findUnique).mockResolvedValue({
				id: ruleId,
				name: "versioned-rule",
				userId: "user_456",
				organizationId: null,
				visibility: "public",
				version: "1.0",
				description: null,
				tags: null,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				latestVersionId: null,
				downloads: 0,
				stars: 0,
				user: {
					id: "user_456",
					username: "otheruser",
				},
				organization: null,
			});

			// Mock version exists
			vi.mocked(mockDb.ruleVersion.findFirst).mockResolvedValue({
				id: "v1",
				ruleId,
				versionNumber: version.toString(),
				changelog: null,
				contentHash: "hash1",
				r2ObjectKey: `rules/${ruleId}/versions/v1/content.md`,
				createdBy: "user_456",
				createdAt: Math.floor(Date.now() / 1000),
				creator: {
					id: "user_456",
					username: "otheruser",
				},
			});

			// Mock R2 content - R2Object has text() method directly, not body.text()
			const content = "# Version 1 Content";
			const mockR2Response = {
				text: async () => content,
			};
			mockR2.get.mockResolvedValue(mockR2Response);
			
			// Also ensure the environment R2 points to our mock
			mockEnv.R2 = mockR2;

			const result = await client.rules.getVersion({ id: ruleId, version: version.toString() });

			expect(result.content).toBe(content);
			expect(result.version).toBe(version.toString());
		});
	});
});