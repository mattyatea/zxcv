import { beforeEach, describe, expect, mock, test } from "bun:test";
import axios from "axios";
import { ConfigManager } from "../../src/config";
import type { Rule } from "../../src/types";
import { ApiClient } from "../../src/utils/api";

// Mock axios
mock.module("axios", () => ({
	default: {
		create: mock(() => ({
			post: mock(),
			interceptors: {
				request: {
					use: mock(),
				},
				response: {
					use: mock(),
				},
			},
		})),
		isAxiosError: mock((error: any) => error.isAxiosError === true),
	},
}));

describe("ApiClient", () => {
	let config: ConfigManager;
	let apiClient: ApiClient;
	let mockPost: any;

	beforeEach(() => {
		config = new ConfigManager();
		config.setAuthToken("test-token");

		// Reset axios mock
		const mockAxios = axios as any;
		mockPost = mock();
		mockAxios.create.mockReturnValue({
			post: mockPost,
			interceptors: {
				request: {
					use: mock(),
				},
				response: {
					use: mock(),
				},
			},
		});

		apiClient = new ApiClient(config);
	});

	test("should create axios instance with correct base URL", () => {
		const mockAxios = axios as any;
		expect(mockAxios.create).toHaveBeenCalledWith({
			baseURL: config.getApiUrl(),
			headers: {
				"Content-Type": "application/json",
			},
		});
	});

	test("should login and return token", async () => {
		const mockToken = "new-auth-token";
		mockPost.mockResolvedValueOnce({
			data: { token: mockToken },
		});

		const result = await apiClient.login("testuser", "password123");

		expect(mockPost).toHaveBeenCalledWith("/api/auth/login", {
			username: "testuser",
			password: "password123",
		});
		expect(result.token).toBe(mockToken);
	});

	test("should register user", async () => {
		mockPost.mockResolvedValueOnce({ data: { success: true } });

		await apiClient.register("newuser", "user@example.com", "password123");

		expect(mockPost).toHaveBeenCalledWith("/api/auth/register", {
			username: "newuser",
			email: "user@example.com",
			password: "password123",
		});
	});

	test("should get rule by path", async () => {
		const mockRule: Rule = {
			id: "rule-123",
			name: "test-rule",
			content: "# Test",
			visibility: "public",
			tags: ["test"],
			version: "1.0.0",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};

		mockPost.mockResolvedValueOnce({ data: mockRule });

		const result = await apiClient.getRule("test-rule");

		expect(mockPost).toHaveBeenCalledWith("/api/rules/getByPath", {
			path: "test-rule",
		});
		expect(result).toEqual(mockRule);
	});

	test("should get rule content", async () => {
		const mockContent = { content: "# Rule Content\n\nThis is the content." };
		mockPost.mockResolvedValueOnce({ data: mockContent });

		const result = await apiClient.getRuleContent("rule-123");

		expect(mockPost).toHaveBeenCalledWith("/api/rules/getContent", {
			ruleId: "rule-123",
		});
		expect(result.content).toBe(mockContent.content);
	});

	test("should create rule", async () => {
		const newRule = {
			name: "new-rule",
			content: "# New Rule",
			visibility: "public" as const,
			tags: ["new", "test"],
		};

		const mockCreatedRule: Rule = {
			id: "new-rule-id",
			...newRule,
			version: "1.0.0",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};

		mockPost.mockResolvedValueOnce({ data: mockCreatedRule });

		const result = await apiClient.createRule(newRule);

		expect(mockPost).toHaveBeenCalledWith("/api/rules/create", newRule);
		expect(result).toEqual(mockCreatedRule);
	});

	test("should update rule", async () => {
		const updates = {
			content: "# Updated Content",
			changelog: "Fixed typo",
		};

		const mockUpdatedRule: Rule = {
			id: "rule-123",
			name: "test-rule",
			content: updates.content,
			visibility: "public",
			tags: ["test"],
			version: "1.0.1",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-02T00:00:00Z",
		};

		mockPost.mockResolvedValueOnce({ data: mockUpdatedRule });

		const result = await apiClient.updateRule("rule-123", updates);

		expect(mockPost).toHaveBeenCalledWith("/api/rules/update", {
			ruleId: "rule-123",
			...updates,
		});
		expect(result).toEqual(mockUpdatedRule);
	});

	test("should search rules", async () => {
		const searchQuery = {
			searchTerm: "typescript",
			tags: ["coding"],
			limit: 10,
		};

		const mockRules: Rule[] = [
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

		mockPost.mockResolvedValueOnce({ data: { rules: mockRules } });

		const result = await apiClient.searchRules(searchQuery);

		expect(mockPost).toHaveBeenCalledWith("/api/rules/search", searchQuery);
		expect(result).toEqual(mockRules);
	});

	test("should get rule versions", async () => {
		const mockVersions = [
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

		mockPost.mockResolvedValueOnce({ data: { versions: mockVersions } });

		const result = await apiClient.getRuleVersions("rule-123");

		expect(mockPost).toHaveBeenCalledWith("/api/rules/versions", {
			ruleId: "rule-123",
		});
		expect(result).toEqual(mockVersions);
	});

	test("should handle API errors", async () => {
		const axiosError = {
			isAxiosError: true,
			response: {
				status: 404,
				data: {
					message: "Rule not found",
				},
			},
		};

		mockPost.mockRejectedValueOnce(axiosError);

		try {
			await apiClient.getRule("non-existent");
			expect(true).toBe(false); // Should not reach here
		} catch (error: any) {
			expect(error.response.status).toBe(404);
			expect(error.response.data.message).toBe("Rule not found");
		}
	});
});
