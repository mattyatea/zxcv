import { afterEach, beforeEach, describe, expect, test, mock } from "bun:test";
import { ConfigManager } from "../../src/config";
import type { Rule } from "../../src/types";
import { ApiClient } from "../../src/utils/api";
import { TEST_CWD } from "../setup";

// Mock axios for testing
mock.module("axios", () => ({
	default: {
		create: () => ({
			interceptors: {
				request: { use: () => {} },
				response: { use: () => {} },
			},
			post: async (url: string, data: any) => {
				// Mock responses based on URL
				if (url === "/api/auth/login") {
					if (data.username === "testuser" && data.password === "password123") {
						return { data: { token: "new-auth-token" } };
					}
					throw new Error("Invalid credentials");
				}
				if (url === "/api/auth/register") {
					return { data: {} };
				}
				if (url === "/api/rules/getByPath") {
					if (data.path === "test-rule") {
						return {
							data: {
								id: "rule-123",
								name: "test-rule",
								content: "# Test",
								visibility: "public",
								tags: ["test"],
								version: "1.0.0",
								createdAt: "2024-01-01T00:00:00Z",
								updatedAt: "2024-01-01T00:00:00Z",
							},
						};
					}
					throw new Error("Rule not found");
				}
				if (url === "/api/rules/getContent") {
					if (data.id === "rule-123") {
						return {
							data: {
								content: "# Rule Content\n\nThis is the content.",
								version: data.version || "1.0.0",
							},
						};
					}
					throw new Error("Rule not found");
				}
				if (url === "/api/rules/create") {
					return {
						data: {
							id: "new-rule-id",
							name: data.name,
							content: data.content,
							visibility: data.visibility,
							tags: data.tags,
							version: "1.0.0",
							createdAt: "2024-01-01T00:00:00Z",
							updatedAt: "2024-01-01T00:00:00Z",
						},
					};
				}
				if (url === "/api/rules/update") {
					if (data.ruleId === "rule-123") {
						return {
							data: {
								id: "rule-123",
								name: "test-rule",
								content: data.content || "# Test",
								visibility: "public",
								tags: ["test"],
								version: "1.0.1",
								createdAt: "2024-01-01T00:00:00Z",
								updatedAt: "2024-01-02T00:00:00Z",
							},
						};
					}
					throw new Error("Rule not found");
				}
				if (url === "/api/rules/search") {
					if (data.searchTerm === "typescript") {
						return {
							data: {
								rules: [
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
								],
							},
						};
					}
					return { data: { rules: [] } };
				}
				if (url === "/api/rules/versions") {
					if (data.ruleId === "rule-123") {
						return {
							data: {
								versions: [
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
								],
							},
						};
					}
					return { data: { versions: [] } };
				}
				throw new Error(`Unexpected URL: ${url}`);
			},
		}),
	},
}));

describe("ApiClient", () => {
	let config: ConfigManager;
	let apiClient: ApiClient;

	beforeEach(() => {
		process.chdir(TEST_CWD);
		// Set API URL via environment variable
		process.env.ZXCV_API_URL = "https://api.example.com";
		config = new ConfigManager();
		config.setAuthToken("test-token");
		apiClient = new ApiClient(config);
	});

	afterEach(() => {
		// Clean up environment variable
		delete process.env.ZXCV_API_URL;
	});

	test("should create axios instance with correct base URL", () => {
		// The ApiClient should create an axios instance with the configured base URL
		expect(apiClient).toBeDefined();
		// The instance is created in the constructor
		expect(config.getApiUrl()).toBe("https://api.example.com");
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

	test("should get rule content with specific version", async () => {
		const result = await apiClient.getRuleContent("rule-123", "1.0.0");
		expect(result.content).toBe("# Rule Content\n\nThis is the content.");
		expect(result.version).toBe("1.0.0");
	});

	test("should create rule", async () => {
		const newRule = {
			name: "new-rule",
			content: "# New Rule",
			visibility: "public" as const,
			tags: ["test", "new"],
		};

		const result = await apiClient.createRule(newRule);
		expect(result.id).toBe("new-rule-id");
		expect(result.name).toBe("new-rule");
		expect(result.content).toBe("# New Rule");
		expect(result.visibility).toBe("public");
		expect(result.tags).toEqual(["test", "new"]);
	});

	test("should update rule", async () => {
		const updates = {
			content: "# Updated Content",
			changelog: "Updated the content",
		};

		const result = await apiClient.updateRule("rule-123", updates);
		expect(result.id).toBe("rule-123");
		expect(result.content).toBe("# Updated Content");
		expect(result.version).toBe("1.0.1");
	});

	test("should search rules", async () => {
		const results = await apiClient.searchRules({ searchTerm: "typescript" });
		expect(results).toHaveLength(1);
		expect(results[0].name).toBe("typescript-rules");
		expect(results[0].tags).toContain("typescript");
	});

	test("should get rule versions", async () => {
		const versions = await apiClient.getRuleVersions("rule-123");
		expect(versions).toHaveLength(2);
		expect(versions[0].version).toBe("1.0.1");
		expect(versions[0].changelog).toBe("Updated content");
		expect(versions[1].version).toBe("1.0.0");
		expect(versions[1].changelog).toBe("Initial version");
	});

	test("should handle API errors", async () => {
		// Test error handling for invalid login
		await expect(apiClient.login("wronguser", "wrongpass")).rejects.toThrow("Invalid credentials");

		// Test error handling for non-existent rule
		await expect(apiClient.getRule("non-existent")).rejects.toThrow("Rule not found");
	});
});
