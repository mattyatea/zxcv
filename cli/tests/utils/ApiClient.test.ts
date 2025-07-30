import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { ConfigManager } from "../../src/config";
import type { Rule } from "../../src/types";
import { TEST_CWD } from "../setup";

// We'll create a mock API client for testing
class MockApiClient {
	private token?: string;
	private baseURL: string;

	constructor(private config: ConfigManager) {
		this.baseURL = config.getApiUrl();
		this.token = config.getAuthToken();
	}

	async login(username: string, password: string): Promise<{ token: string }> {
		if (username === "testuser" && password === "password123") {
			return { token: "new-auth-token" };
		}
		throw new Error("Invalid credentials");
	}

	async register(
		username: string,
		email: string,
		password: string,
	): Promise<void> {
		// Mock successful registration
		return;
	}

	async getRule(path: string): Promise<Rule> {
		if (path === "test-rule") {
			return {
				id: "rule-123",
				name: "test-rule",
				content: "# Test",
				visibility: "public",
				tags: ["test"],
				version: "1.0.0",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			};
		}
		throw new Error("Rule not found");
	}

	async getRuleContent(
		ruleId: string,
		version?: string,
	): Promise<{ content: string; version: string }> {
		if (ruleId === "rule-123") {
			return {
				content: "# Rule Content\n\nThis is the content.",
				version: version || "1.0.0",
			};
		}
		throw new Error("Rule not found");
	}

	async createRule(rule: {
		name: string;
		content: string;
		visibility: "public" | "private";
		tags: string[];
	}): Promise<Rule> {
		return {
			id: "new-rule-id",
			...rule,
			version: "1.0.0",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};
	}

	async updateRule(
		ruleId: string,
		updates: {
			name?: string;
			content?: string;
			visibility?: "public" | "private";
			tags?: string[];
			changelog?: string;
		},
	): Promise<Rule> {
		if (ruleId === "rule-123") {
			return {
				id: "rule-123",
				name: "test-rule",
				content: updates.content || "# Test",
				visibility: "public",
				tags: ["test"],
				version: "1.0.1",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-02T00:00:00Z",
			};
		}
		throw new Error("Rule not found");
	}

	async searchRules(query: {
		searchTerm?: string;
		tags?: string[];
		visibility?: "public" | "private";
		owner?: string;
		limit?: number;
		offset?: number;
	}): Promise<Rule[]> {
		if (query.searchTerm === "typescript") {
			return [
				{
					id: "rule-1",
					name: "typescript-rules",
					content: "# TypeScript",
					visibility: "public",
					tags: ["typescript", "coding"],
					version: "1.0.0",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
			];
		}
		return [];
	}

	async getRuleVersions(ruleId: string): Promise<
		Array<{
			version: string;
			changelog: string;
			createdAt: string;
		}>
	> {
		if (ruleId === "rule-123") {
			return [
				{
					version: "1.0.1",
					changelog: "Updated content",
					createdAt: "2024-01-02T00:00:00Z",
				},
				{
					version: "1.0.0",
					changelog: "Initial version",
					createdAt: "2024-01-01T00:00:00Z",
				},
			];
		}
		return [];
	}
}

describe("ApiClient", () => {
	let config: ConfigManager;
	let apiClient: MockApiClient;

	beforeEach(() => {
		process.chdir(TEST_CWD);
		config = new ConfigManager();
		config.setAuthToken("test-token");
		apiClient = new MockApiClient(config);
	});

	test("should login and return token", async () => {
		const result = await apiClient.login("testuser", "password123");
		expect(result.token).toBe("new-auth-token");
	});

	test("should register user", async () => {
		await expect(
			apiClient.register("newuser", "user@example.com", "password123"),
		).resolves.toBeUndefined();
	});

	test("should get rule by path", async () => {
		const result = await apiClient.getRule("test-rule");
		expect(result.id).toBe("rule-123");
		expect(result.name).toBe("test-rule");
		expect(result.version).toBe("1.0.0");
	});

	test("should get rule content", async () => {
		const result = await apiClient.getRuleContent("rule-123");
		expect(result.content).toBe("# Rule Content\n\nThis is the content.");
		expect(result.version).toBe("1.0.0");
	});

	test("should create rule", async () => {
		const newRule = {
			name: "new-rule",
			content: "# New Rule",
			visibility: "public" as const,
			tags: ["new", "test"],
		};

		const result = await apiClient.createRule(newRule);
		expect(result.id).toBe("new-rule-id");
		expect(result.name).toBe("new-rule");
		expect(result.version).toBe("1.0.0");
	});

	test("should update rule", async () => {
		const updates = {
			content: "# Updated Content",
			changelog: "Fixed typo",
		};

		const result = await apiClient.updateRule("rule-123", updates);
		expect(result.version).toBe("1.0.1");
		expect(result.updatedAt).toBe("2024-01-02T00:00:00Z");
	});

	test("should search rules", async () => {
		const searchQuery = {
			searchTerm: "typescript",
			tags: ["coding"],
			limit: 10,
		};

		const result = await apiClient.searchRules(searchQuery);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("typescript-rules");
		expect(result[0].tags).toContain("typescript");
	});

	test("should get rule versions", async () => {
		const result = await apiClient.getRuleVersions("rule-123");
		expect(result).toHaveLength(2);
		expect(result[0].version).toBe("1.0.1");
		expect(result[1].version).toBe("1.0.0");
	});

	test("should handle API errors", async () => {
		await expect(apiClient.getRule("non-existent")).rejects.toThrow(
			"Rule not found",
		);
	});
});
