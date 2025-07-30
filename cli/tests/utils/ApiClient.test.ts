import { afterEach, beforeEach, describe, expect, test, mock, spyOn } from "bun:test";
import { ConfigManager } from "../../src/config";
import type { Rule } from "../../src/types";
import { ApiClient } from "../../src/utils/api";
import { TEST_CWD } from "../setup";
import axios from "axios";

describe("ApiClient", () => {
	let config: ConfigManager;
	let apiClient: ApiClient;
	let mockPost: any;
	let mockAxiosCreate: any;

	beforeEach(() => {
		process.chdir(TEST_CWD);
		// Set API URL via environment variable
		process.env.ZXCV_API_URL = "https://api.example.com";
		config = new ConfigManager();
		config.setAuthToken("test-token");

		// Mock axios.create to return our mock instance
		mockPost = mock();
		mockAxiosCreate = spyOn(axios, "create").mockReturnValue({
			interceptors: {
				request: { use: mock() },
				response: { use: mock() },
			},
			post: mockPost,
		} as any);

		apiClient = new ApiClient(config);
	});

	afterEach(() => {
		// Clean up environment variable
		delete process.env.ZXCV_API_URL;
		mockAxiosCreate?.mockRestore();
	});

	test("should create axios instance with correct base URL", () => {
		expect(mockAxiosCreate).toHaveBeenCalledWith({
			baseURL: "https://api.example.com",
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
		const mockContent = {
			content: "# Rule Content\n\nThis is the content.",
			version: "1.0.0",
		};

		mockPost.mockResolvedValueOnce({ data: mockContent });

		const result = await apiClient.getRuleContent("rule-123");

		expect(mockPost).toHaveBeenCalledWith("/api/rules/getContent", {
			id: "rule-123",
		});
		expect(result).toEqual(mockContent);
	});

	test("should create rule", async () => {
		const newRule = {
			name: "new-rule",
			content: "# New Rule",
			visibility: "public" as const,
			tags: ["test", "new"],
		};

		const mockCreatedRule: Rule = {
			id: "new-rule-id",
			name: "new-rule",
			content: "# New Rule",
			visibility: "public",
			tags: ["test", "new"],
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
			changelog: "Updated the content",
		};

		const mockUpdatedRule: Rule = {
			id: "rule-123",
			name: "test-rule",
			content: "# Updated Content",
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
		// Test error for login
		mockPost.mockRejectedValueOnce({
			isAxiosError: true,
			response: {
				status: 401,
				data: { message: "Invalid credentials" },
			},
		});

		try {
			await apiClient.login("wronguser", "wrongpass");
			expect(true).toBe(false); // Should not reach here
		} catch (error: any) {
			expect(error.response.status).toBe(401);
			expect(error.response.data.message).toBe("Invalid credentials");
		}

		// Test error for getRule
		mockPost.mockRejectedValueOnce({
			isAxiosError: true,
			response: {
				status: 404,
				data: { message: "Rule not found" },
			},
		});

		try {
			await apiClient.getRule("non-existent");
			expect(true).toBe(false); // Should not reach here
		} catch (error: any) {
			expect(error.response.status).toBe(404);
			expect(error.response.data.message).toBe("Rule not found");
		}
	});
});
