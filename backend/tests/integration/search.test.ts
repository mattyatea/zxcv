import { describe, expect, it, beforeEach } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks, createTestUser } from "../helpers/setup";

describe("Search endpoints", () => {
	setupTestHooks();
	
	let authToken: string;
	let testUserId: string;

	beforeEach(async () => {
		const result = await createTestUser({
			email: `search-${Date.now()}@example.com`,
			username: `search${Math.floor(Math.random() * 10000)}`,
			password: "password123",
		});
		authToken = result.token;
		testUserId = result.user.id;
	});

	describe("GET /rules/search", () => {
		it("should return search results with default parameters", async () => {
			const response = await SELF.fetch("http://localhost/rules/search", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.results).toBeDefined();
			expect(Array.isArray(data.results)).toBe(true);
			expect(data.total).toBeDefined();
			expect(data.limit).toBeDefined();
			expect(data.offset).toBeDefined();
		});

		it("should support text search", async () => {
			const response = await SELF.fetch("http://localhost/rules/search?q=test", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.results).toBeDefined();
			expect(Array.isArray(data.results)).toBe(true);
		});

		it("should support tag filtering", async () => {
			const response = await SELF.fetch("http://localhost/rules/search?tags=javascript,eslint", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.results).toBeDefined();
		});

		it("should support author filtering", async () => {
			const response = await SELF.fetch("http://localhost/rules/search?author=testuser", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.results).toBeDefined();
		});

		it("should support visibility filtering", async () => {
			const response = await SELF.fetch("http://localhost/rules/search?visibility=public", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.results).toBeDefined();
		});

		it("should support sorting", async () => {
			const response = await SELF.fetch("http://localhost/rules/search?sort=updated&order=desc", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.results).toBeDefined();
		});

		it("should support pagination", async () => {
			const response = await SELF.fetch("http://localhost/rules/search?limit=10&offset=0", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.limit).toBe(10);
			expect(data.offset).toBe(0);
		});

		it("should validate pagination parameters", async () => {
			const response = await SELF.fetch("http://localhost/rules/search?limit=0", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(400);
		});

		it("should validate sort parameters", async () => {
			const response = await SELF.fetch("http://localhost/rules/search?sort=invalid", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(400);
		});

		it("should handle authenticated search", async () => {
			const response = await SELF.fetch("http://localhost/rules/search", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.results).toBeDefined();
		});

		it("should return appropriate results for team visibility", async () => {
			const response = await SELF.fetch("http://localhost/rules/search?visibility=team", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.results).toBeDefined();
			expect(Array.isArray(data.results)).toBe(true);
		});
	});
});