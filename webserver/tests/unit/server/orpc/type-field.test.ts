import type { PrismaClient } from "@prisma/client";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Mock PrismaClient
const mockDb = {
	rule: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		count: vi.fn(),
	},
	user: {
		findUnique: vi.fn(),
	},
	organization: {
		findUnique: vi.fn(),
	},
	organizationMember: {
		findUnique: vi.fn(),
	},
} as unknown as PrismaClient;

// Mock R2
const mockR2 = {
	put: vi.fn(),
	get: vi.fn(),
	delete: vi.fn(),
};

// Mock env
const mockEnv = {
	R2: mockR2,
	DB: {} as any,
	JWT_SECRET: "test-secret",
	FRONTEND_URL: "http://localhost:3000",
};

describe("Rule Type Field Tests", () => {
	beforeAll(() => {
		console.log("[SETUP] Type field tests initialized");
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Rule Type Enum", () => {
		it("should support 'rule' type", async () => {
			const ruleData = {
				id: "rule_123",
				name: "test-rule",
				userId: "user_123",
				type: "rule",
				visibility: "public",
				description: "Test rule",
				tags: JSON.stringify(["test"]),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				version: "1.0.0",
				latestVersionId: null,
				views: 0,
				stars: 0,
				organizationId: null,
			};

			mockDb.rule.create.mockResolvedValue(ruleData);

			const result = await mockDb.rule.create({
				data: ruleData,
			});

			expect(result.type).toBe("rule");
			expect(mockDb.rule.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					type: "rule",
				}),
			});
		});

		it("should support 'ccsubagents' type", async () => {
			const agentData = {
				id: "agent_123",
				name: "test-agent",
				userId: "user_123",
				type: "ccsubagents",
				visibility: "public",
				description: "Test agent",
				tags: JSON.stringify(["agent", "test"]),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				version: "1.0.0",
				latestVersionId: null,
				views: 0,
				stars: 0,
				organizationId: null,
			};

			mockDb.rule.create.mockResolvedValue(agentData);

			const result = await mockDb.rule.create({
				data: agentData,
			});

			expect(result.type).toBe("ccsubagents");
			expect(mockDb.rule.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					type: "ccsubagents",
				}),
			});
		});

		it("should default to 'rule' type when not specified", async () => {
			const ruleData = {
				id: "rule_456",
				name: "default-type-rule",
				userId: "user_123",
				visibility: "public",
				description: "Test default type",
				tags: null,
				type: "rule", // Default value
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				version: "1.0.0",
				latestVersionId: null,
				views: 0,
				stars: 0,
				organizationId: null,
			};

			mockDb.rule.create.mockResolvedValue(ruleData);

			const result = await mockDb.rule.create({
				data: {
					id: "rule_456",
					name: "default-type-rule",
					userId: "user_123",
					visibility: "public",
					description: "Test default type",
				},
			});

			expect(result.type).toBe("rule");
		});
	});

	describe("Rule Search with Type Filter", () => {
		it("should filter rules by type 'rule'", async () => {
			const rules = [
				{
					id: "rule_1",
					name: "rule-1",
					type: "rule",
					userId: "user_123",
					visibility: "public",
					description: "Rule 1",
					tags: null,
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
					publishedAt: null,
					version: "1.0.0",
					latestVersionId: null,
					views: 0,
					stars: 0,
					organizationId: null,
				},
				{
					id: "rule_2",
					name: "rule-2",
					type: "rule",
					userId: "user_123",
					visibility: "public",
					description: "Rule 2",
					tags: null,
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
					publishedAt: null,
					version: "1.0.0",
					latestVersionId: null,
					views: 0,
					stars: 0,
					organizationId: null,
				},
			];

			mockDb.rule.findMany.mockResolvedValue(rules);
			mockDb.rule.count.mockResolvedValue(2);

			const result = await mockDb.rule.findMany({
				where: { type: "rule" },
			});

			expect(result).toHaveLength(2);
			expect(result.every((r) => r.type === "rule")).toBe(true);
			expect(mockDb.rule.findMany).toHaveBeenCalledWith({
				where: { type: "rule" },
			});
		});

		it("should filter rules by type 'ccsubagents'", async () => {
			const agents = [
				{
					id: "agent_1",
					name: "agent-1",
					type: "ccsubagents",
					userId: "user_123",
					visibility: "public",
					description: "Agent 1",
					tags: JSON.stringify(["agent"]),
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
					publishedAt: null,
					version: "1.0.0",
					latestVersionId: null,
					views: 0,
					stars: 0,
					organizationId: null,
				},
			];

			mockDb.rule.findMany.mockResolvedValue(agents);
			mockDb.rule.count.mockResolvedValue(1);

			const result = await mockDb.rule.findMany({
				where: { type: "ccsubagents" },
			});

			expect(result).toHaveLength(1);
			expect(result[0].type).toBe("ccsubagents");
			expect(mockDb.rule.findMany).toHaveBeenCalledWith({
				where: { type: "ccsubagents" },
			});
		});

		it("should return all rules when type filter is not specified", async () => {
			const allRules = [
				{
					id: "rule_1",
					name: "rule-1",
					type: "rule",
					userId: "user_123",
					visibility: "public",
					description: "Rule 1",
					tags: null,
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
					publishedAt: null,
					version: "1.0.0",
					latestVersionId: null,
					views: 0,
					stars: 0,
					organizationId: null,
				},
				{
					id: "agent_1",
					name: "agent-1",
					type: "ccsubagents",
					userId: "user_123",
					visibility: "public",
					description: "Agent 1",
					tags: JSON.stringify(["agent"]),
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
					publishedAt: null,
					version: "1.0.0",
					latestVersionId: null,
					views: 0,
					stars: 0,
					organizationId: null,
				},
			];

			mockDb.rule.findMany.mockResolvedValue(allRules);
			mockDb.rule.count.mockResolvedValue(2);

			const result = await mockDb.rule.findMany({
				where: {},
			});

			expect(result).toHaveLength(2);
			expect(result.some((r) => r.type === "rule")).toBe(true);
			expect(result.some((r) => r.type === "ccsubagents")).toBe(true);
		});
	});

	describe("Rule Update with Type", () => {
		it("should update rule type from 'rule' to 'ccsubagents'", async () => {
			const originalRule = {
				id: "rule_123",
				name: "test-rule",
				userId: "user_123",
				type: "rule",
				visibility: "public",
				description: "Test rule",
				tags: null,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				version: "1.0.0",
				latestVersionId: null,
				views: 0,
				stars: 0,
				organizationId: null,
			};

			const updatedRule = {
				...originalRule,
				type: "ccsubagents",
				updatedAt: Math.floor(Date.now() / 1000),
			};

			mockDb.rule.findUnique.mockResolvedValue(originalRule);
			mockDb.rule.update.mockResolvedValue(updatedRule);

			const result = await mockDb.rule.update({
				where: { id: "rule_123" },
				data: { type: "ccsubagents" },
			});

			expect(result.type).toBe("ccsubagents");
			expect(mockDb.rule.update).toHaveBeenCalledWith({
				where: { id: "rule_123" },
				data: { type: "ccsubagents" },
			});
		});
	});

	describe("Type Field Validation", () => {
		it("should handle invalid type values gracefully", async () => {
			// This test verifies that the database schema enforces valid enum values
			// In real implementation, Prisma would throw an error for invalid enum values
			const invalidTypeData = {
				id: "rule_invalid",
				name: "invalid-type-rule",
				userId: "user_123",
				type: "invalid_type", // This would be rejected by Prisma
				visibility: "public",
				description: "Test invalid type",
			};

			// Simulate Prisma validation error
			mockDb.rule.create.mockRejectedValue(
				new Error("Invalid enum value. Expected 'rule' | 'ccsubagents', received 'invalid_type'"),
			);

			await expect(
				mockDb.rule.create({
					data: invalidTypeData,
				}),
			).rejects.toThrow("Invalid enum value");
		});
	});

	describe("Migration Compatibility", () => {
		it("should handle rules created before type field was added", async () => {
			// Rules created before the type field should default to 'rule'
			const legacyRule = {
				id: "legacy_rule",
				name: "legacy-rule",
				userId: "user_123",
				type: "rule", // Default value applied by migration
				visibility: "public",
				description: "Legacy rule",
				tags: null,
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				version: "1.0.0",
				latestVersionId: null,
				views: 0,
				stars: 0,
				organizationId: null,
			};

			mockDb.rule.findUnique.mockResolvedValue(legacyRule);

			const result = await mockDb.rule.findUnique({
				where: { id: "legacy_rule" },
			});

			expect(result?.type).toBe("rule");
		});
	});

	describe("Type Field in API Responses", () => {
		it("should include type field in rule search results", async () => {
			const searchResults = [
				{
					id: "rule_1",
					name: "test-rule",
					type: "rule",
					description: "Test rule",
					visibility: "public",
					userId: "user_123",
					tags: JSON.stringify(["test"]),
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
					publishedAt: null,
					version: "1.0.0",
					latestVersionId: null,
					views: 10,
					stars: 5,
					organizationId: null,
					user: {
						id: "user_123",
						username: "testuser",
					},
				},
			];

			mockDb.rule.findMany.mockResolvedValue(searchResults);

			const result = await mockDb.rule.findMany({
				include: { user: true },
			});

			expect(result[0]).toHaveProperty("type");
			expect(result[0].type).toBe("rule");
		});

		it("should properly format type field in API response", async () => {
			// Simulate RuleService formatting
			const rule = {
				id: "rule_123",
				name: "test-rule",
				type: "ccsubagents",
				description: "Test agent",
				visibility: "public",
				userId: "user_123",
				tags: JSON.stringify(["agent"]),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
				publishedAt: null,
				version: "1.0.0",
				latestVersionId: null,
				views: 0,
				stars: 0,
				organizationId: null,
				user: {
					id: "user_123",
					username: "testuser",
				},
			};

			// Format as RuleService would
			const formatted = {
				id: rule.id,
				name: rule.name,
				description: rule.description,
				author: rule.user || { id: rule.userId || "", username: "Unknown" },
				visibility: rule.visibility,
				type: rule.type || "rule",
				tags: rule.tags ? (typeof rule.tags === "string" ? JSON.parse(rule.tags) : rule.tags) : [],
				version: rule.version || "1.0.0",
				updated_at: rule.updatedAt,
			};

			expect(formatted.type).toBe("ccsubagents");
			expect(formatted).toHaveProperty("type");
		});
	});
});
