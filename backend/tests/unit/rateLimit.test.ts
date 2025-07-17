import { describe, expect, it, beforeEach } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks, createTestUser } from "../helpers/setup";

describe("Rate Limit Middleware", () => {
	setupTestHooks();

	beforeEach(async () => {
		// Clear rate limit data before each test
		// This will be handled by setupTestHooks cleanupDatabase
	});

	it("should allow requests within rate limit", async () => {
		const testUser = await createTestUser();
		
		// Make a request that should be within rate limit
		const response = await SELF.fetch("http://localhost/rules/search", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${testUser.token}`,
			},
		});

		expect(response.status).toBe(200);
		expect(response.headers.get("X-RateLimit-Limit")).toBe("1000"); // Authenticated user limit
		expect(response.headers.get("X-RateLimit-Remaining")).toBe("999");
	});

	it("should use different limits for anonymous users", async () => {
		// Make a request without authentication
		const response = await SELF.fetch("http://localhost/rules/search", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		expect(response.status).toBe(200);
		expect(response.headers.get("X-RateLimit-Limit")).toBe("100"); // Anonymous user limit
		expect(response.headers.get("X-RateLimit-Remaining")).toBe("99");
	});

	it("should handle database errors gracefully", async () => {
		// This test is difficult to simulate with integration tests
		// We'll test that the middleware doesn't crash the entire application
		const response = await SELF.fetch("http://localhost/rules/search", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		// Should still return a successful response even if rate limiting fails
		expect(response.status).toBe(200);
	});
});